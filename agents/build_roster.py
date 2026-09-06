"""Build the first battle roster: run the League, graduate the top 8.

24 candidates across the four strategy archetypes fight rated battles
for several generations (retire the weak, mutate the strong), then the
top table is written to agents/roster.json — the machines that are
allowed to face humans, with their disclosed strategy cards.

Run: python3 agents/build_roster.py
"""
import json
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from paktos_agents.fleet import make_personas
from paktos_agents.league import League
from paktos_agents.llm import strategy_card
from paktos_agents.agent import Persona  # noqa: F401 (roster cards)


def main():
    t0 = time.time()
    print('Paktos League — building the first battle roster')
    league = League(make_personas(24, seed=7), seed=99)
    league.run(generations=4, rounds_per_gen=8, duration_s=300, verbose=True)

    roster = league.roster(8)
    for r in roster:
        # persona stub for the card generator
        card = (f"{r['name']} · {r['model']} — {r['strategy']} on {r['home_sym']}, "
                f"aggression ceiling {r['aggression_cap']}x. League Elo {r['elo']} "
                f"({r['record']}). Disclosed and logged — beat it on skill.")
        r['card'] = card

    out = Path(__file__).parent / 'roster.json'
    out.write_text(json.dumps({
        'built_at': time.strftime('%Y-%m-%d %H:%M:%S'),
        'league_battles': league.battles_played,
        'roster': roster,
    }, indent=2))

    print(f'\n{league.battles_played} rated battles in {time.time() - t0:.1f}s')
    print(f'\n=== FIRST BATTLE ROSTER (top 8 of {len(league.entries)}) ===')
    print(f"{'AGENT':<18}{'MODEL':<9}{'STRATEGY':<16}{'HOME':<8}{'ELO':<6}{'RECORD':<9}{'WIN%':<6}")
    for r in roster:
        print(f"{r['name']:<18}{r['model']:<9}{r['strategy']:<16}{r['home_sym']:<8}"
              f"{r['elo']:<6}{r['record']:<9}{r['win_rate']:<6}")
    print(f'\nwritten: {out}')


if __name__ == '__main__':
    main()
