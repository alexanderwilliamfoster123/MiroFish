"""Execution layer — one interface, three venues.

Agents never talk to a venue directly; they call an ExecutionAdapter.
SimAdapter runs battles against the in-process SimMarket (works today,
no infrastructure). MT5ManagerAdapter is the production venue: our own
broker's MT5 server via the MetaQuotes Manager API (or a REST wrapper
over it — Kenmore, mtapi.io, mt5api.org). MetaApiAdapter covers the
cloud-API route for piloting without server access.

The interface is deliberately tiny: provision an account, read prices
and equity, open/close positions, read closed trades. That is the whole
contract a battle needs, and it maps 1:1 onto Manager API calls.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field

BATTLE_CAPITAL = 10_000.0


@dataclass
class Position:
    sym: str
    direction: int          # +1 long, -1 short
    exposure: float         # notional as a fraction of capital (leverage-ish)
    entry_px: float
    opened_at: float


@dataclass
class ClosedTrade:
    sym: str
    direction: int
    pnl: float
    opened_at: float
    closed_at: float


@dataclass
class DemoAccount:
    acct_id: str
    balance: float = BATTLE_CAPITAL
    positions: list[Position] = field(default_factory=list)
    closed: list[ClosedTrade] = field(default_factory=list)


class ExecutionAdapter(ABC):
    @abstractmethod
    def create_account(self, acct_id: str) -> None: ...

    @abstractmethod
    def price(self, sym: str) -> float: ...

    @abstractmethod
    def vol_s(self, sym: str) -> float: ...

    @abstractmethod
    def open_position(self, acct_id: str, sym: str, direction: int, exposure: float, now: float) -> None: ...

    @abstractmethod
    def close_all(self, acct_id: str, now: float) -> float: ...

    @abstractmethod
    def equity(self, acct_id: str) -> float: ...

    @abstractmethod
    def closed_trades(self, acct_id: str) -> list[ClosedTrade]: ...

    def ret_pct(self, acct_id: str) -> float:
        return (self.equity(acct_id) / BATTLE_CAPITAL - 1) * 100


class SimAdapter(ExecutionAdapter):
    """In-process venue against SimMarket — the demo/regression venue."""

    def __init__(self, market):
        self.market = market
        self.accounts: dict[str, DemoAccount] = {}

    def create_account(self, acct_id: str) -> None:
        self.accounts[acct_id] = DemoAccount(acct_id)

    def price(self, sym: str) -> float:
        return self.market.price(sym)

    def vol_s(self, sym: str) -> float:
        return self.market.vol_s(sym)

    def open_position(self, acct_id, sym, direction, exposure, now) -> None:
        self.accounts[acct_id].positions.append(
            Position(sym, direction, exposure, self.market.price(sym), now))

    def close_all(self, acct_id, now) -> float:
        acct = self.accounts[acct_id]
        total = 0.0
        for p in acct.positions:
            ret = (self.market.price(p.sym) / p.entry_px - 1) * p.direction
            pnl = ret * p.exposure * BATTLE_CAPITAL
            acct.balance += pnl
            acct.closed.append(ClosedTrade(p.sym, p.direction, pnl, p.opened_at, now))
            total += pnl
        acct.positions.clear()
        return total

    def equity(self, acct_id: str) -> float:
        acct = self.accounts[acct_id]
        eq = acct.balance
        for p in acct.positions:
            ret = (self.market.price(p.sym) / p.entry_px - 1) * p.direction
            eq += ret * p.exposure * BATTLE_CAPITAL
        return eq

    def closed_trades(self, acct_id: str) -> list[ClosedTrade]:
        return self.accounts[acct_id].closed


class MT5ManagerAdapter(ExecutionAdapter):
    """Production venue: our broker's MT5 server via the Manager API.

    Wiring (not runnable without server credentials, hence stubs):
      create_account  -> UserAdd + DealerBalance into a dedicated demo
                         group (e.g. `demo\\paktos-battles`), login stored
                         as acct_id — this is also how human battle
                         accounts (BTL-<seq>) get provisioned
      price / vol_s   -> subscribe symbol ticks (or bridge feed)
      open_position   -> DealerSend market order, volume derived from
                         exposure * BATTLE_CAPITAL / contract size
      close_all       -> PositionGet + opposing DealerSend per position
      equity          -> UserAccountGet.equity
      closed_trades   -> DealRequest over the battle window — the same
                         records settlement and the spectate tape read
    REST wrappers (Kenmore / mtapi.io / mt5api.org) expose these as
    HTTP endpoints if we skip native .NET bindings.
    """

    def __init__(self, server: str, manager_login: int, password: str):
        raise NotImplementedError(
            'Requires MT5 server credentials — wire per the class docstring.')

    def create_account(self, acct_id): ...
    def price(self, sym): ...
    def vol_s(self, sym): ...
    def open_position(self, acct_id, sym, direction, exposure, now): ...
    def close_all(self, acct_id, now): ...
    def equity(self, acct_id): ...
    def closed_trades(self, acct_id): ...


class MetaApiAdapter(ExecutionAdapter):
    """Cloud-API route (MetaApi / API2Trade / indexnano) — pilot venue
    when Manager API access isn't at hand. Same mapping as above via
    their REST/WS SDKs; one provisioned cloud account per agent."""

    def __init__(self, token: str):
        raise NotImplementedError('Requires a cloud MT5 API token.')

    def create_account(self, acct_id): ...
    def price(self, sym): ...
    def vol_s(self, sym): ...
    def open_position(self, acct_id, sym, direction, exposure, now): ...
    def close_all(self, acct_id, now): ...
    def equity(self, acct_id): ...
    def closed_trades(self, acct_id): ...
