"""The Battle Director — the piece nobody sells.

A meta-policy above whatever strategy an agent runs. Every tick it looks
at exactly three things — the gap to the opponent, the clock, and current
volatility — and answers one question: what risk posture maximises the
probability of winning THIS battle?

The core quantity is the deficit measured in reachable standard
deviations:

    z = gap / (vol_s * sqrt(seconds_left))

i.e. "how many sigmas of fully-invested random-walk drift would I need
to close the gap in the time remaining?" Small z: normal edge-grinding
still wins. Large z: only variance wins, so the correct play — the
'gambling for resurrection' result — is to raise variance until the win
probability is non-trivial. Symmetrically, a leader late in the window
should cut variance and sit on the lead.
"""
from __future__ import annotations

import math
from dataclasses import dataclass
from enum import Enum


class Mode(Enum):
    GRIND = 'grind'        # normal play, work the edge
    PUSH = 'push'          # size up, rotate toward higher-beta instruments
    SPRINT = 'sprint'      # high-frequency churn, big size, hunt volatility
    MOONSHOT = 'moonshot'  # max-variance single conviction bet — all or nothing
    DEFEND = 'defend'      # leading late: cut size, shorten holds
    PARK = 'park'          # big lead, little time: flat, let the clock run


@dataclass
class Directive:
    mode: Mode
    risk_mult: float        # multiplier on the agent's base exposure
    trade_interval: float   # seconds between decisions (churn rate)
    hunt_volatility: bool   # rotate into the hottest instrument
    z: float                # the deficit-in-sigmas that produced this


class BattleDirector:
    def __init__(self, aggression_cap: float = 4.0, caution: float = 1.0):
        # aggression_cap: personality ceiling on risk_mult (degen bots high,
        # disciplined bots low). caution: >1 defends leads earlier.
        self.aggression_cap = aggression_cap
        self.caution = caution

    def assess(self, my_ret: float, opp_ret: float,
               seconds_left: float, vol_s: float) -> Directive:
        gap = opp_ret - my_ret  # in return %; positive = we are behind
        seconds_left = max(1.0, seconds_left)
        reachable = max(1e-9, vol_s * 100.0 * math.sqrt(seconds_left))
        z = gap / reachable

        if z <= 0:  # we lead
            lead_z = -z
            if lead_z > 1.5 * self.caution and seconds_left < 120:
                return Directive(Mode.PARK, 0.0, 1e9, False, z)
            if lead_z > 0.8 * self.caution and seconds_left < 300:
                return Directive(Mode.DEFEND, 0.5, 60.0, False, z)
            return Directive(Mode.GRIND, 1.0, 45.0, False, z)

        if z < 0.9:
            return Directive(Mode.GRIND, 1.0, 45.0, False, z)
        if z < 2.0:
            return Directive(Mode.PUSH, min(2.0, self.aggression_cap), 20.0, True, z)
        if z < 4.0:
            return Directive(Mode.SPRINT, min(3.5, self.aggression_cap), 5.0, True, z)
        return Directive(Mode.MOONSHOT, self.aggression_cap, 12.0, True, z)
