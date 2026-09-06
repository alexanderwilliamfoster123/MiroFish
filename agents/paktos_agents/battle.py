"""Battle — one head-to-head window, kick-off to settlement.

Runs two sides against the same venue and clock. Sides can be
agent-vs-humansim (production shape: the human side is a real account we
only *read*) or agent-vs-agent (training / exhibition battles). At the
bell everything is flattened and the higher account return sweeps the
pot — same settlement rule as the platform.
"""
from __future__ import annotations

from dataclasses import dataclass, field

from .agent import BattleAgent


@dataclass
class Battle:
    a: BattleAgent
    b: BattleAgent
    duration_s: float
    pot: float
    market: object
    now: float = 0.0
    tape: list = field(default_factory=list)

    def seconds_left(self) -> float:
        return max(0.0, self.duration_s - self.now)

    def tick(self, dt: float = 1.0) -> None:
        self.market.tick(dt)
        self.now += dt
        left = self.seconds_left()
        ra = self.a.adapter.ret_pct(self.a.acct_id)
        rb = self.b.adapter.ret_pct(self.b.acct_id)
        self.a.tick(self.now, left, opp_ret=rb)
        self.b.tick(self.now, left, opp_ret=ra)

    def snapshot(self) -> dict:
        return {
            't': round(self.now),
            'seconds_left': round(self.seconds_left()),
            'a': {'name': self.a.persona.name,
                  'ret': round(self.a.adapter.ret_pct(self.a.acct_id), 3),
                  'mode': self.a.log[-1][1].value if self.a.log else 'grind',
                  'trades': len(self.a.adapter.closed_trades(self.a.acct_id))},
            'b': {'name': self.b.persona.name,
                  'ret': round(self.b.adapter.ret_pct(self.b.acct_id), 3),
                  'mode': self.b.log[-1][1].value if self.b.log else 'grind',
                  'trades': len(self.b.adapter.closed_trades(self.b.acct_id))},
        }

    def run(self, dt: float = 1.0, observer=None) -> dict:
        while self.seconds_left() > 0:
            self.tick(dt)
            if observer:
                observer(self)
        self.a.adapter.close_all(self.a.acct_id, self.now)
        self.b.adapter.close_all(self.b.acct_id, self.now)
        ra = self.a.adapter.ret_pct(self.a.acct_id)
        rb = self.b.adapter.ret_pct(self.b.acct_id)
        winner = self.a if ra >= rb else self.b
        return {
            'winner': winner.persona.name,
            'a_ret': round(ra, 3), 'b_ret': round(rb, 3),
            'pot': self.pot,
            'a_trades': len(self.a.adapter.closed_trades(self.a.acct_id)),
            'b_trades': len(self.b.adapter.closed_trades(self.b.acct_id)),
            'a_modes': [(round(t), m.value, z) for t, m, z in self.a.log],
            'b_modes': [(round(t), m.value, z) for t, m, z in self.b.log],
        }
