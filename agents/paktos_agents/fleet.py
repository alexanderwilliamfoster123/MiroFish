"""Fleet — mass-produce personas and run many battles at once.

A hundred agents is a hundred jittered personas over the four archetype
strategies, each with its own temperament. Battles are cheap (pure
Python against the sim; against MT5 they're I/O-bound), so a plain
thread/async pool covers the fleet at 1-second cadence.
"""
from __future__ import annotations

import random

from .agent import BattleAgent, Persona
from .battle import Battle
from .execution import SimAdapter
from .market import SimMarket
from .strategies import ARCHETYPES

FIRST = ['Atlas', 'Vega', 'Onyx', 'Quill', 'Rhea', 'Sable', 'Titan', 'Iris',
         'Nyx', 'Zeno', 'Echo', 'Falcon', 'Gale', 'Helix', 'Ion', 'Juno']
MODELS = ['GPT-5', 'Claude', 'Gemini']


def make_personas(n: int, seed: int = 7) -> list[Persona]:
    rng = random.Random(seed)
    syms = ['BTC', 'ETH', 'NAS100', 'XAUUSD', 'EURUSD', 'GBPJPY']
    out = []
    for i in range(n):
        arch = ARCHETYPES[i % len(ARCHETYPES)]
        strat = arch() if arch.__name__ != 'Scalper' else arch(seed + i)
        out.append(Persona(
            name=f'{FIRST[i % len(FIRST)]}-{i:03d}',
            model=MODELS[i % len(MODELS)],
            strategy=strat,
            aggression_cap=rng.uniform(2.0, 6.0),
            caution=rng.uniform(0.7, 1.5),
            base_exposure=rng.uniform(0.2, 0.5),
            home_sym=rng.choice(syms),
        ))
    return out


def run_exhibition(n_battles: int, duration_s: float = 900, seed: int = 11) -> list[dict]:
    """n agent-vs-agent battles, each on its own market — a training or
    stress run. Returns settlement dicts."""
    personas = make_personas(n_battles * 2, seed)
    results = []
    for k in range(n_battles):
        market = SimMarket(seed + k)
        adapter = SimAdapter(market)
        a = BattleAgent(personas[2 * k], adapter, f'BTL-A{k}')
        b = BattleAgent(personas[2 * k + 1], adapter, f'BTL-B{k}')
        results.append(Battle(a, b, duration_s, pot=5000, market=market).run())
    return results
