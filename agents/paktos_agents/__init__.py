"""Paktos agent engine — machine opponents that play the battle, not the market.

Layers: SimMarket/ExecutionAdapter (venue) -> Strategy (signal) ->
BattleDirector (score+clock-aware risk posture) -> BattleAgent (persona)
-> Battle/fleet (orchestration). MT5 Manager API plugs in as an adapter.
"""
from .agent import BattleAgent, Persona
from .battle import Battle
from .director import BattleDirector, Mode
from .execution import BATTLE_CAPITAL, ExecutionAdapter, SimAdapter
from .fleet import make_personas, run_exhibition
from .market import SimMarket

__all__ = ['BattleAgent', 'Persona', 'Battle', 'BattleDirector', 'Mode',
           'BATTLE_CAPITAL', 'ExecutionAdapter', 'SimAdapter',
           'make_personas', 'run_exhibition', 'SimMarket']
