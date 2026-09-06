"""Engine invariants. Run: python3 agents/tests/test_engine.py"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from paktos_agents import (BattleDirector, Mode, SimAdapter, SimMarket,
                           run_exhibition)
from paktos_agents.execution import BATTLE_CAPITAL, COMMISSION
from paktos_agents.fleet import make_personas
from paktos_agents.league import League

passed = failed = 0


def ok(name, cond):
    global passed, failed
    passed, failed = passed + (1 if cond else 0), failed + (0 if cond else 1)
    print(('PASS' if cond else 'FAIL') + ' - ' + name)


d = BattleDirector(aggression_cap=4.0)

# behind late -> escalation; the deeper the hole, the hotter the mode
early_small = d.assess(my_ret=0.0, opp_ret=0.1, seconds_left=800, vol_s=0.0005)
late_medium = d.assess(my_ret=0.0, opp_ret=1.0, seconds_left=120, vol_s=0.0005)
late_deep = d.assess(my_ret=-1.0, opp_ret=3.0, seconds_left=60, vol_s=0.0005)
ok('early small gap grinds', early_small.mode is Mode.GRIND)
ok('late medium gap escalates', late_medium.mode in (Mode.PUSH, Mode.SPRINT))
ok('late deep gap goes max variance', late_deep.mode in (Mode.SPRINT, Mode.MOONSHOT))
ok('risk rises with desperation',
   early_small.risk_mult < late_medium.risk_mult <= late_deep.risk_mult)
ok('sprint churns faster than grind',
   d.assess(0.0, 1.2, 90, 0.0005).trade_interval < early_small.trade_interval)

# leading late -> de-risk
lead_late = d.assess(my_ret=2.0, opp_ret=0.2, seconds_left=90, vol_s=0.0005)
ok('big lead late parks or defends', lead_late.mode in (Mode.PARK, Mode.DEFEND))
ok('defending risk below grinding risk', lead_late.risk_mult < 1.0)

# personality cap respected
timid = BattleDirector(aggression_cap=1.5).assess(0.0, 5.0, 30, 0.0005)
ok('aggression cap respected', timid.risk_mult <= 1.5)

# venue accounting: equity moves, trades close, returns finite
m = SimMarket(seed=1)
a = SimAdapter(m)
a.create_account('T1')
a.open_position('T1', 'BTC', 1, 0.5, 0.0)
for _ in range(60):
    m.tick(1.0)
a.close_all('T1', 60.0)
ok('closed trade recorded', len(a.closed_trades('T1')) == 1)
ok('return is finite and plausible', abs(a.ret_pct('T1')) < 50)

# costs: an instant round-trip on an unmoved market loses exactly
# spread + two commissions — churn is not free
mc = SimMarket(seed=2)
ac = SimAdapter(mc)
for _ in range(10):
    mc.tick(1.0)  # build history but measure without further ticks
ac.create_account('C1')
ac.open_position('C1', 'BTC', 1, 1.0, 0.0)
ac.close_all('C1', 1.0)
expected_loss = (mc.spread('BTC') + 2 * COMMISSION) * BATTLE_CAPITAL
actual_loss = BATTLE_CAPITAL - ac.equity('C1')
ok('round-trip costs spread + commission', abs(actual_loss - expected_loss) < 0.01)

# league: ratings move, population is stable, roster is sorted
lg = League(make_personas(8, seed=3), seed=4)
lg.run(generations=2, rounds_per_gen=3, duration_s=120)
ok('league battles played', lg.battles_played == 2 * 3 * 4)
ok('population size stable', len(lg.entries) == 8)
ok('elo separated', lg.table()[0].elo > lg.table()[-1].elo)
r = lg.roster(4)
ok('roster sorted by elo', all(r[i]['elo'] >= r[i + 1]['elo'] for i in range(3)))
ok('mutants entered the pool', any(e.gen > 0 for e in lg.entries))

# full exhibition battles settle
results = run_exhibition(n_battles=4, duration_s=300, seed=5)
ok('exhibition battles all settle', len(results) == 4 and all('winner' in r for r in results))
ok('agents actually trade', all(r['a_trades'] + r['b_trades'] > 2 for r in results))

print(f'\n==== ENGINE: {passed + failed} checks, {failed} failures ====')
sys.exit(1 if failed else 0)
