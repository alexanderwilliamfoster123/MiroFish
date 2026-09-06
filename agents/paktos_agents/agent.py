"""BattleAgent — one machine opponent.

Personality = base strategy + risk temperament + tempo. The Director
decides the posture each tick from (gap, clock, vol); the agent executes
it: which instrument, which direction, what size, how often. A hundred
agents = a hundred Personas with jittered parameters, one engine.
"""
from __future__ import annotations

import random
from dataclasses import dataclass, field

from .director import BattleDirector, Directive, Mode
from .strategies import Momentum, Scalper, Strategy


@dataclass
class Persona:
    name: str
    model: str                       # display persona, e.g. 'GPT-5' / 'Claude'
    strategy: Strategy
    aggression_cap: float = 3.5      # ceiling the Director may push risk to
    caution: float = 1.0             # how early it defends a lead
    base_exposure: float = 0.35      # fraction of capital deployed in GRIND
    home_sym: str = 'BTC'


@dataclass
class BattleAgent:
    persona: Persona
    adapter: object
    acct_id: str
    directed: bool = True            # False = no Director (used for human sims)
    last_trade_at: float = -1e9
    hold_until: float = 0.0
    log: list = field(default_factory=list)
    director: BattleDirector = None
    scalper: Scalper = None
    rng: random.Random = None

    def __post_init__(self):
        self.director = BattleDirector(self.persona.aggression_cap, self.persona.caution)
        self.scalper = Scalper()
        self.rng = random.Random(hash(self.persona.name) & 0xFFFF)
        self.adapter.create_account(self.acct_id)

    def tick(self, now: float, seconds_left: float, opp_ret: float) -> None:
        my_ret = self.adapter.ret_pct(self.acct_id)
        if self.directed:
            d = self.director.assess(my_ret, opp_ret, seconds_left,
                                     self.adapter.vol_s(self.persona.home_sym))
        else:  # human sim / undirected bot: constant grind posture
            d = Directive(Mode.GRIND, 1.0, 40.0, False, 0.0)
        self._record_mode(now, d)

        if d.mode is Mode.PARK:
            self.adapter.close_all(self.acct_id, now)
            return
        if now - self.last_trade_at < d.trade_interval and now < self.hold_until:
            return

        sym = self.persona.home_sym
        if d.hunt_volatility:
            sym = self.adapter.market.hottest() if hasattr(self.adapter, 'market') else sym
        strat = self.scalper if d.mode in (Mode.SPRINT,) else self.persona.strategy
        direction, conviction = strat.signal(self.adapter, sym) \
            if not hasattr(self.adapter, 'market') else strat.signal(self.adapter.market, sym)
        if d.mode is Mode.MOONSHOT and direction == 0:
            direction, conviction = self.rng.choice([-1, 1]), 1.0  # all-in beats sure loss
        if direction == 0:
            return

        self.adapter.close_all(self.acct_id, now)
        exposure = min(4.0, self.persona.base_exposure * d.risk_mult * (0.5 + conviction))
        self.adapter.open_position(self.acct_id, sym, direction, exposure, now)
        self.last_trade_at = now
        self.hold_until = now + (seconds_left if d.mode is Mode.MOONSHOT
                                 else d.trade_interval * 2)

    def _record_mode(self, now: float, d: Directive) -> None:
        if not self.log or self.log[-1][1] is not d.mode:
            self.log.append((now, d.mode, round(d.z, 2)))
