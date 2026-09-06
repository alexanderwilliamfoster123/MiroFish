"""Signal strategies — where the hundred personalities come from.

Each returns a direction in {-1, 0, +1} plus conviction in [0, 1].
These four archetypes cover the corpus shapes (trend, mean-reversion,
breakout, scalp/churn); mass-produce variants by jittering their
parameters per agent. Ported strategy code from freqtrade-strategies /
Qlib alphas plugs in as more Strategy subclasses — the engine doesn't
care where a signal comes from.
"""
from __future__ import annotations

import random
from abc import ABC, abstractmethod


class Strategy(ABC):
    name = 'base'

    @abstractmethod
    def signal(self, market, sym: str) -> tuple[int, float]: ...


class Momentum(Strategy):
    """Ride the recent drift."""
    name = 'momentum'

    def __init__(self, lookback: int = 30):
        self.lookback = lookback

    def signal(self, market, sym):
        rets = market.returns(sym, self.lookback)
        if len(rets) < self.lookback // 2:
            return 0, 0.0
        total = sum(rets)
        vol = market.vol_s(sym) * max(1, len(rets)) ** 0.5
        strength = min(1.0, abs(total) / max(vol, 1e-9))
        return (1 if total > 0 else -1), strength


class MeanReversion(Strategy):
    """Fade the stretch back toward the rolling mean."""
    name = 'mean-reversion'

    def __init__(self, lookback: int = 60, band: float = 1.2):
        self.lookback, self.band = lookback, band

    def signal(self, market, sym):
        h = market.instruments[sym].history[-self.lookback:]
        if len(h) < self.lookback // 2:
            return 0, 0.0
        mean = sum(h) / len(h)
        dev = (h[-1] - mean) / mean
        thresh = market.vol_s(sym) * self.band * (len(h) ** 0.5)
        if abs(dev) < thresh:
            return 0, 0.0
        return (-1 if dev > 0 else 1), min(1.0, abs(dev) / (thresh * 2))


class Breakout(Strategy):
    """Go with a break of the recent range."""
    name = 'breakout'

    def __init__(self, lookback: int = 90):
        self.lookback = lookback

    def signal(self, market, sym):
        h = market.instruments[sym].history[-self.lookback:]
        if len(h) < self.lookback // 2:
            return 0, 0.0
        hi, lo, px = max(h[:-1]), min(h[:-1]), h[-1]
        if px > hi:
            return 1, 0.8
        if px < lo:
            return -1, 0.8
        return 0, 0.0


class Scalper(Strategy):
    """Rapid-fire micro-momentum — the SPRINT-mode weapon. Trades the
    last few ticks' direction with a coin-flip floor so it always has a
    view; variance is the point."""
    name = 'scalper'

    def __init__(self, seed: int | None = None):
        self.rng = random.Random(seed)

    def signal(self, market, sym):
        rets = market.returns(sym, 5)
        total = sum(rets)
        if abs(total) < 1e-9:
            return self.rng.choice([-1, 1]), 0.6
        return (1 if total > 0 else -1), 0.9


ARCHETYPES = [Momentum, MeanReversion, Breakout, Scalper]
