# Paktos Agent Engine

Machine opponents that play **the battle**, not just the market: every tick
each agent weighs the gap to its opponent, the time left on the clock, and
current volatility, and adjusts its risk posture to maximise the probability
of winning the pot. Trailing late → high-frequency churn and volatility
hunting; leading late → de-risk and park the lead.

Pure-stdlib Python. No dependencies to run the sim, the demo, or the tests.

## Run it

```sh
python3 agents/demo.py              # two 15-min battles, incl. a handicapped
                                    # fight showing grind→push→sprint→moonshot
python3 agents/build_roster.py      # run the League, graduate the top 8 to
                                    # agents/roster.json (the battle roster)
python3 agents/tests/test_engine.py # 18 engine invariants
```

## Architecture

```
market.py      SimMarket — INSTR-style simulated feed w/ vol regimes
execution.py   ExecutionAdapter — the venue contract (create account, price,
               open/close, equity, closed trades)
               ├─ SimAdapter          in-process venue (works today)
               ├─ MT5ManagerAdapter   PRODUCTION: our broker's MT5 server via
               │                      the MetaQuotes Manager API (wiring notes
               │                      in the class docstring; REST wrappers:
               │                      Kenmore / mtapi.io / mt5api.org)
               └─ MetaApiAdapter      cloud-API pilot route
strategies.py  signal archetypes (momentum / mean-reversion / breakout /
               scalper) — freqtrade/Qlib ports plug in as more subclasses
director.py    THE BATTLE DIRECTOR — z = gap / (vol·√t_left) mapped to
               grind / push / sprint / moonshot / defend / park, with
               per-persona aggression caps
agent.py       Persona + BattleAgent (director → strategy → orders)
battle.py      one window: clock, tape, settlement (higher return sweeps)
fleet.py       mass-produce jittered personas; run many battles
league.py      THE LEAGUE — Elo-rated self-play: every candidate fights
               rated battles, each generation the bottom third retires and
               mutants of the top third enter; only graduates face humans,
               and their league Elo is the disclosed difficulty rating
llm.py         optional: Claude-written strategy cards; TradingAgents
               (Apache-2.0) as a long-window strategy-selector sidecar —
               never in the per-second loop
```

## MT5 wiring (we own the broker)

`MT5ManagerAdapter` maps the venue contract onto Manager API calls —
UserAdd/DealerBalance to provision a battle account (same path provisions
the *human* side's `BTL-<seq>` accounts), DealerSend for orders,
UserAccountGet for equity, DealRequest for the settlement-grade closed-trade
record. Implement it against the .NET Manager API or a REST wrapper and the
whole fleet moves to real MT5 demo accounts without touching agents.

## Costs are real

SimAdapter charges the spread on entry/exit plus per-side commission, and
equity marks to the closable side — so churn has a price and sprint mode
must earn it. Agents ride a position when the signal hasn't changed
instead of paying the spread to re-open the same view. A deterministic
test pins the exact round-trip cost.

## Honest notes

- The Director's thresholds are hand-set v0. The upgrade path is training
  RL policies (FinRL + SB3) on battle episodes with win-the-pot reward —
  the same escalation emerges learned instead of scripted. Mode flicker
  near thresholds wants hysteresis before anything user-facing.
- Fairness/regulatory: agents' strategy cards are disclosed (`llm.py`) and
  every trade is on the record — machines play hard *within published
  behaviour*, and platform economics stay on the commission, not the
  machines' win rate. House-backed real-money battles remain gated on
  legal sign-off (see CLAUDE.md §6).
