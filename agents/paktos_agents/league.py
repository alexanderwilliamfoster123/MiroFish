"""The League — where 'best' gets manufactured, not picked.

Candidate agents play rated exhibition battles against each other
around the clock (sim battles are nearly free). Every agent carries an
Elo rating updated per battle; each generation the bottom third retires
and is replaced by mutated clones of the top third. Only agents that
survive the league face humans — and their league record IS the
disclosed difficulty rating in Battle the Machines.

Fairness note: this is self-play among our own agents on simulated
markets. No human data is involved; humans only ever meet the graduates.
"""
from __future__ import annotations

import random
from dataclasses import dataclass, field

from .agent import BattleAgent, Persona
from .battle import Battle
from .execution import SimAdapter
from .market import SimMarket
from .strategies import Breakout, MeanReversion, Momentum, Scalper

K = 24.0  # Elo K-factor
SYMS = ['BTC', 'ETH', 'NAS100', 'XAUUSD', 'EURUSD', 'GBPJPY']


@dataclass
class Entry:
    persona: Persona
    elo: float = 1200.0
    wins: int = 0
    losses: int = 0
    gen: int = 0

    @property
    def record(self) -> str:
        return f'{self.wins}-{self.losses}'

    @property
    def win_rate(self) -> float:
        n = self.wins + self.losses
        return self.wins / n * 100 if n else 0.0


def _expected(ra: float, rb: float) -> float:
    return 1.0 / (1.0 + 10 ** ((rb - ra) / 400.0))


def mutate(p: Persona, rng: random.Random, gen: int, idx: int) -> Persona:
    """A jittered descendant — same archetype family unless a rare
    cross-family mutation fires."""
    jit = lambda v, lo, hi, pct=0.25: max(lo, min(hi, v * rng.uniform(1 - pct, 1 + pct)))
    arch = type(p.strategy)
    if rng.random() < 0.15:
        arch = rng.choice([Momentum, MeanReversion, Breakout, Scalper])
    if arch is Momentum:
        strat = Momentum(lookback=max(8, int(jit(getattr(p.strategy, 'lookback', 30), 8, 240))))
    elif arch is MeanReversion:
        strat = MeanReversion(lookback=max(15, int(jit(getattr(p.strategy, 'lookback', 60), 15, 300))),
                              band=jit(getattr(p.strategy, 'band', 1.2), 0.5, 3.0))
    elif arch is Breakout:
        strat = Breakout(lookback=max(20, int(jit(getattr(p.strategy, 'lookback', 90), 20, 400))))
    else:
        strat = Scalper(rng.randint(0, 9999))
    base = p.name.split('.')[0]
    return Persona(
        name=f'{base}.g{gen}-{idx}',
        model=p.model,
        strategy=strat,
        aggression_cap=jit(p.aggression_cap, 1.5, 7.0),
        caution=jit(p.caution, 0.5, 2.0),
        base_exposure=jit(p.base_exposure, 0.1, 0.6),
        home_sym=rng.choice(SYMS) if rng.random() < 0.3 else p.home_sym,
    )


class League:
    def __init__(self, personas: list[Persona], seed: int = 0):
        self.entries = [Entry(p) for p in personas]
        self.rng = random.Random(seed)
        self.battles_played = 0

    def _battle(self, ea: Entry, eb: Entry, duration_s: float) -> None:
        market = SimMarket(self.rng.randint(0, 10 ** 9))
        adapter = SimAdapter(market)
        a = BattleAgent(ea.persona, adapter, 'LG-A')
        b = BattleAgent(eb.persona, adapter, 'LG-B')
        result = Battle(a, b, duration_s, pot=0, market=market).run()
        a_won = result['winner'] == ea.persona.name
        exp = _expected(ea.elo, eb.elo)
        ea.elo += K * ((1.0 if a_won else 0.0) - exp)
        eb.elo += K * ((0.0 if a_won else 1.0) - (1.0 - exp))
        (ea if a_won else eb).wins += 1
        (eb if a_won else ea).losses += 1
        self.battles_played += 1

    def play_round(self, duration_s: float = 300) -> None:
        """One round: everyone fights once, paired by rating proximity
        (close matches are the most informative)."""
        order = sorted(self.entries, key=lambda e: e.elo + self.rng.uniform(-40, 40))
        for i in range(0, len(order) - 1, 2):
            self._battle(order[i], order[i + 1], duration_s)

    def evolve(self, gen: int) -> None:
        """Retire the bottom third; refill with mutants of the top third."""
        self.entries.sort(key=lambda e: e.elo, reverse=True)
        n = len(self.entries)
        cut = n - n // 3
        elite = self.entries[: n // 3]
        survivors = self.entries[:cut]
        recruits = [Entry(mutate(elite[i % len(elite)].persona, self.rng, gen, i),
                          elo=1150.0, gen=gen)
                    for i in range(n - cut)]
        self.entries = survivors + recruits

    def run(self, generations: int = 3, rounds_per_gen: int = 6,
            duration_s: float = 300, verbose: bool = False) -> None:
        for g in range(1, generations + 1):
            for _ in range(rounds_per_gen):
                self.play_round(duration_s)
            if g < generations:
                self.evolve(g)
            if verbose:
                top = max(self.entries, key=lambda e: e.elo)
                print(f'  gen {g}: {self.battles_played} battles played, '
                      f'top {top.persona.name} elo {top.elo:.0f} ({top.record})')

    def table(self) -> list[Entry]:
        return sorted(self.entries, key=lambda e: e.elo, reverse=True)

    def roster(self, n: int = 8) -> list[dict]:
        out = []
        for e in self.table()[:n]:
            p = e.persona
            out.append({
                'name': p.name, 'model': p.model,
                'strategy': p.strategy.name, 'home_sym': p.home_sym,
                'aggression_cap': round(p.aggression_cap, 2),
                'caution': round(p.caution, 2),
                'base_exposure': round(p.base_exposure, 2),
                'elo': round(e.elo), 'record': e.record,
                'win_rate': round(e.win_rate, 1), 'gen': e.gen,
            })
        return out
