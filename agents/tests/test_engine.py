"""Engine invariants. Run: python3 agents/tests/test_engine.py"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from paktos_agents import (BattleDirector, Mode, SimAdapter, SimMarket,
                           run_exhibition)

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

# full exhibition battles settle
results = run_exhibition(n_battles=4, duration_s=300, seed=5)
ok('exhibition battles all settle', len(results) == 4 and all('winner' in r for r in results))
ok('agents actually trade', all(r['a_trades'] + r['b_trades'] > 2 for r in results))

print(f'\n==== ENGINE: {passed + failed} checks, {failed} failures ====')
sys.exit(1 if failed else 0)
