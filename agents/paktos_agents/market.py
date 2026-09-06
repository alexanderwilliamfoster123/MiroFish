"""Simulated multi-instrument market feed.

Mirrors the INSTR universe of the dashboard. Prices follow a geometric
random walk with occasional volatility-regime shifts, so battles have
quiet stretches and violent ones. Swappable for a live feed (WorldMonitor
API or MT5 tick stream) without touching agents — everything downstream
reads prices through ExecutionAdapter.price().
"""
from __future__ import annotations

import math
import random
from dataclasses import dataclass, field


@dataclass
class Instrument:
    sym: str
    px: float
    vol_s: float          # per-second return std at 1x exposure (fraction)
    spread: float = 0.0002  # full bid-ask spread as a return fraction
    regime: float = 1.0   # current vol multiplier
    history: list = field(default_factory=list)

    def tick(self, dt: float, rng: random.Random) -> None:
        if rng.random() < 0.002:  # regime shift a few times per hour
            self.regime = rng.choice([0.6, 1.0, 1.0, 1.6, 2.4])
        sigma = self.vol_s * self.regime * math.sqrt(dt)
        self.px *= math.exp(rng.gauss(-0.5 * sigma * sigma, sigma))
        self.history.append(self.px)
        if len(self.history) > 900:
            del self.history[: len(self.history) - 900]


class SimMarket:
    """The whole simulated exchange: tick() advances every instrument."""

    def __init__(self, seed: int | None = None):
        self.rng = random.Random(seed)
        self.t = 0.0
        self.instruments: dict[str, Instrument] = {
            i.sym: i
            for i in [
                Instrument('BTC', 118432.0, 0.00050, spread=0.00020),
                Instrument('ETH', 4212.5, 0.00060, spread=0.00030),
                Instrument('NAS100', 23841.2, 0.00022, spread=0.00010),
                Instrument('XAUUSD', 3392.4, 0.00018, spread=0.00012),
                Instrument('EURUSD', 1.17432, 0.00007, spread=0.00004),
                Instrument('GBPJPY', 199.842, 0.00012, spread=0.00008),
            ]
        }

    def tick(self, dt: float = 1.0) -> None:
        self.t += dt
        for ins in self.instruments.values():
            ins.tick(dt, self.rng)

    def price(self, sym: str) -> float:
        return self.instruments[sym].px

    def vol_s(self, sym: str) -> float:
        ins = self.instruments[sym]
        return ins.vol_s * ins.regime

    def spread(self, sym: str) -> float:
        return self.instruments[sym].spread

    def hottest(self) -> str:
        """Highest current volatility — where a trailing agent goes hunting."""
        return max(self.instruments.values(), key=lambda i: i.vol_s * i.regime).sym

    def returns(self, sym: str, n: int) -> list[float]:
        h = self.instruments[sym].history[-(n + 1):]
        return [h[i + 1] / h[i] - 1 for i in range(len(h) - 1)]
