"""Optional LLM layer — personality, not order flow.

Two uses, both out of the tick loop:
  1. strategy_card(persona): the disclosed 'what this machine does' card
     shown before a battle — the transparency piece of the skill-
     competition posture. Template by default; with ANTHROPIC_API_KEY
     set, Claude writes it in the persona's voice.
  2. TradingAgents (github.com/TauricResearch/TradingAgents, Apache-2.0,
     Anthropic-supported): for long-window battles (1d+), its analyst ->
     debate -> trader -> risk pipeline can act as the *strategy selector*
     that repoints an agent's Persona a few times per day. Run it as a
     sidecar that writes {sym, bias, conviction} into the agent; the
     Director still owns risk posture. Never put it in the per-second loop.
"""
from __future__ import annotations

import json
import os
import urllib.request


def strategy_card(persona) -> str:
    template = (f'{persona.name} · {persona.model}\n'
                f'Style: {persona.strategy.name} on {persona.home_sym}. '
                f'Aggression ceiling {persona.aggression_cap:.1f}x, '
                f'{"defends leads early" if persona.caution > 1.1 else "lets leads ride"}. '
                f'Behind late, it will chase volatility. Disclosed and logged — beat it on skill.')
    key = os.environ.get('ANTHROPIC_API_KEY')
    if not key:
        return template
    try:
        req = urllib.request.Request(
            'https://api.anthropic.com/v1/messages',
            data=json.dumps({
                'model': 'claude-sonnet-5',
                'max_tokens': 200,
                'messages': [{'role': 'user', 'content':
                    'Rewrite this trading-bot strategy card in a confident arena-announcer '
                    'voice, 2 sentences, no emojis, keep every fact: ' + template}],
            }).encode(),
            headers={'content-type': 'application/json', 'x-api-key': key,
                     'anthropic-version': '2023-06-01'})
        with urllib.request.urlopen(req, timeout=20) as r:
            return json.load(r)['content'][0]['text'].strip()
    except Exception:
        return template
