"""Demo: watch a machine realise it's losing and change how it plays.

Battle 1 — fair fight, agent vs an undirected 'human' bot.
Battle 2 — the agent starts 3% behind (balance handicap) so the
Director's endgame escalation is guaranteed to show: grind -> push ->
sprint (watch the trade count explode) or moonshot.

Run: python3 agents/demo.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from paktos_agents import Battle, BattleAgent, Persona, SimAdapter, SimMarket
from paktos_agents.llm import strategy_card
from paktos_agents.strategies import MeanReversion, Momentum


def report(tag, battle_result):
    r = battle_result
    print(f'\n=== {tag} ===')
    print(f"winner: {r['winner']}   A {r['a_ret']:+.2f}% ({r['a_trades']} trades)"
          f"   B {r['b_ret']:+.2f}% ({r['b_trades']} trades)")
    print('A mode timeline:', ' -> '.join(f"{m}@{t}s(z={z})" for t, m, z in r['a_modes']))


def main():
    print('Paktos agent engine — battle demo (15-minute window, simulated clock)')

    # battle 1: fair fight
    market = SimMarket(seed=42)
    adapter = SimAdapter(market)
    machine = BattleAgent(
        Persona('Atlas-001', 'Claude', Momentum(), aggression_cap=4.5, home_sym='BTC'),
        adapter, 'BTL-M1')
    human = BattleAgent(
        Persona('jstone', 'human', MeanReversion(), home_sym='NAS100'),
        adapter, 'BTL-H1', directed=False)
    print('\n' + strategy_card(machine.persona))
    report('fair fight', Battle(machine, human, 900, 5000, market).run())

    # battle 2: machine handicapped 3% — endgame escalation guaranteed
    market2 = SimMarket(seed=43)
    adapter2 = SimAdapter(market2)
    machine2 = BattleAgent(
        Persona('Nyx-007', 'GPT-5', Momentum(), aggression_cap=6.0, home_sym='ETH'),
        adapter2, 'BTL-M2')
    human2 = BattleAgent(
        Persona('swisstony', 'human', MeanReversion(), home_sym='XAUUSD'),
        adapter2, 'BTL-H2', directed=False)
    adapter2.accounts['BTL-M2'].balance *= 0.97  # start 3% down
    b = Battle(machine2, human2, 900, 5000, market2)

    marks = {180, 420, 660, 840}
    def observer(bt):
        if int(bt.now) in marks:
            s = bt.snapshot()
            print(f"  t={s['t']:>3}s  {s['a']['name']} {s['a']['ret']:+.2f}% "
                  f"[{s['a']['mode']:<8}] {s['a']['trades']:>3} trades   vs   "
                  f"{s['b']['name']} {s['b']['ret']:+.2f}%")
            marks.discard(int(bt.now))

    print('\n=== handicapped fight (machine starts -3%) — live tape ===')
    report('handicapped fight', b.run(observer=observer))


if __name__ == '__main__':
    main()
