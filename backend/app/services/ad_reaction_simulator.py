"""
Ad Reaction Simulator
Simulates how a specific ad/headline lands with the audience of each seeded
Instagram theme page, using the configured LLM to role-play persona agents.

This is the lightweight "quick sim" path: one structured LLM call per page,
run concurrently. The full MiroFish OASIS pipeline (GraphRAG world + multi-round
agent simulation) remains available through the standard project flow and can
replace this call-per-page backend without changing the API surface.
"""

import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Any, Dict, List, Optional

from ..utils.llm_client import LLMClient
from ..utils.logger import get_logger

logger = get_logger('mirofish.ad_reaction')

MAX_PAGES_PER_RUN = 10
DEFAULT_PERSONAS_PER_PAGE = 4
LLM_WORKERS = 4

# The seeding roster, verbatim as supplied (duplicates kept; merged at parse time)
ROSTER_RAW = """
Uncoveringrobotics
InfuseWithAi
Unfoldedai
InfuseWithAi
DeepNewsAi
Aging.ai
Avoidaging
Timetolearn.ai
Codryx.ai
ChatiaGPT
CryptoAIMentors
Syntral.ai
Futuretechnews.ai
Futuretechnews.ai
Future.Explanation
AIWealthSociety
Uncoveringaitech
Tokenised
Artificialintelligencementors
ArtificialIntelligenceFacts
Infinitemindsai
Theainewsfield
Mindwired.ai
Tricksforai
Ainterestingpage
Startuprevenue.ai
Aitechfield
ArtificialIntelligence.Hub
Deepen.ai
mrlearning.ai
Stics.ai
ia.hub
Theainewsgroup
CataiTech
UnfoldedAi
Nexvion.ai
DeepnewsAI
Artificialintelligencetrickss
Success_AI_Advisors
Theaifield
Theaipage
Ai.upskills
Chatgptintelligence
AIProfitNews
Ai.sources
AiCouncillor
TechCouncillor
Ainterestingupdate
Aiupdateshub
Alpacka.ai
Askgpts
Blunerds
Brun0GPT
Castt.Ai
CatAiPortal
Codehub_tech
Webstrom_tech
Coders_Section
CodingCosmos
coldwar.io
Datasciencebrain
Earningtip.ai
EngineeringCommunity_
Futuremint.ai
Futurewalt.ai
Geekydev.in
Gen3rative
Gotyourtech
Liamporterai
MarketerHub
mind.bridge.ai
Odanilogato
pycode.hubb
Python.coder_
Python.science
Roman.Knox
Sanskaar.ai
Sferro.ai
Spacexpage
Sovereignty.ai
stics.bot
stics.ia
stics.qc
Techgaffer
Techorginals
TecTalks.io
the.natasha.ai
TheNikhil.ai
Thesanskaarsingh
Universodecine
ViralMorzaria
Viralstudios.io
Yajurved.ai
Activeprogrammer
Techin24hours
Youraicompass
Inventastic
Alphabizai
Genaiworks
Learnaifaster
Worldstar
Pubity
Bloopersbehindthescenes
Wasted
Lazonabiz
Alpacka.ai
Inventos
Stics.ai
Howeverythingworks
Rollouts
Winningnmindset
Entrepreneurshipquote
Valorgi
Ia.hub
Explain
Punbible
Spaceinanutshell
Activeprogrammer
Fboy
Millionaire_Mentor
Clips
Beyondstartup.s
Advicefromceo.s
Markets
Lolita
Aiinterestingpage
Nugget
Thequotecircles
Fact.Philes
Pycodehubb
Thebusinessmagnets
Hoodclips
Hood
Success_tips
Aquarius
Entrepreneurinsights
Entrepreneursquote
Menshumor
Fruitsnacks
Fact
Hustlersnthehood
Hoodreels
Thehilariousted
Snoop
Nochills
Pickuplines
Bangerbuddy
Craziesthoodclips
Dailywtfacts
Darkhumor
Tyrone
Liveforclass
Howeverythingworks
Theaifield
Explainedfact
Elite.mindsets
investearnsave
IncomeParent
MindsetOfTheRich
Aiprofitnews
Thegrowinginvestor
Thebillionairesclub
LuxuryLifestyleMagazine
"""

# Ordered keyword heuristics; first match wins. Suggestions only — the page
# name is the only signal available before comment ingestion.
GROUP_RULES = [
    ('Coding & dev', re.compile(
        r'cod(e|ing|ryx)|python|pycode|geekydev|program|engineer|datascience'
        r'|webstrom|nerds', re.I)),
    ('Business & wealth', re.compile(
        r'invest|wealth|profit|million|billionaire|entrepreneur|business'
        r'|income|market|earn|hustl|startup|rich|mindset|success|luxury|ceo'
        r'|revenue|biz\b|lazonabiz|alphabiz|magnets|tokenised|crypto', re.I)),
    ('Memes & culture', re.compile(
        r'hood|humor|humour|clips|punbible|pickup|banger|snoop|tyrone'
        r'|nochills|wasted|worldstar|pubity|lolita|dark|bloopers|fboy'
        r'|menshumor|hilarious|fruitsnacks|viral|aquarius|nugget|quote', re.I)),
    ('Facts & science', re.compile(
        r'fact|explain|space|universo|aging|howeverything|inanutshell|wtf', re.I)),
    ('AI & tech', re.compile(
        r'ai|gpt|generative|gen3|robot|neural|mindwired|artificial|tech'
        r'|learn|future|deepen|syntral|nexvion|stics|token|chat', re.I)),
]
GROUP_OTHER = 'Unclassified'


def _group_of(name: str) -> str:
    for group, pattern in GROUP_RULES:
        if pattern.search(name):
            return group
    return GROUP_OTHER


def get_roster() -> List[Dict[str, Any]]:
    """Parse the raw roster: trim, drop empties, merge case-insensitive duplicates."""
    merged: Dict[str, Dict[str, Any]] = {}
    for line in ROSTER_RAW.splitlines():
        name = line.strip().strip('"').strip()
        if not name:
            continue
        key = name.lower()
        if key in merged:
            merged[key]['mentions'] += 1
        else:
            merged[key] = {'name': name, 'group': _group_of(name), 'mentions': 1}
    return sorted(merged.values(), key=lambda p: p['name'].lower())


SIMULATION_SYSTEM_PROMPT = """You are the audience-simulation engine of MiroFish, \
a swarm-intelligence prediction platform. You role-play the follower community of a \
specific Instagram theme page and predict, honestly and critically, how that community \
reacts when a brand's ad appears in their feed.

Rules:
- Infer the audience only from the page handle and its category. If the ad is a poor \
fit for that audience, say so — low scores and hostile reactions are expected and useful.
- Personas must feel like real commenters of that community: their slang, their level \
of cynicism about ads, their interests. Vary age, occupation and attitude.
- Sentiment percentages must be integers summing to exactly 100.
- engagement_score is 0-100: the likelihood this post earns meaningful engagement \
(likes, comments, saves) from THIS audience, where 50 is an average branded post.
- Respond with JSON only, matching the requested schema exactly."""

SIMULATION_USER_PROMPT = """Instagram page handle: @{handle}
Suggested category: {group}

The following ad is dropped into this page's feed:
Headline: {headline}
{caption_block}
Simulate this page's audience reacting. Return JSON:
{{
  "audience_profile": "one sentence describing who follows this page, inferred from the handle",
  "verdict": "one blunt sentence on how the ad lands with this audience",
  "engagement_score": <int 0-100>,
  "sentiment": {{"advocate": <int>, "positive": <int>, "neutral": <int>, "skeptical": <int>, "hostile": <int>}},
  "top_objection": "the single most common pushback, max 6 words",
  "personas": [
    {{"name": "first name, age", "occupation": "job · city", "mbti": "XXXX",
      "comment": "their comment exactly as they would type it", "sentiment": "advocate|positive|neutral|skeptical|hostile"}}
    ... exactly {n_personas} personas ...
  ]
}}"""

SENTIMENT_KEYS = ['advocate', 'positive', 'neutral', 'skeptical', 'hostile']


def _normalize_sentiment(raw: Any) -> Dict[str, int]:
    """Coerce the model's sentiment dict to non-negative ints summing to 100."""
    values = {}
    for key in SENTIMENT_KEYS:
        try:
            values[key] = max(0, int(round(float((raw or {}).get(key, 0)))))
        except (TypeError, ValueError):
            values[key] = 0
    total = sum(values.values())
    if total <= 0:
        return {'advocate': 0, 'positive': 0, 'neutral': 100, 'skeptical': 0, 'hostile': 0}
    scaled = {k: int(round(v * 100.0 / total)) for k, v in values.items()}
    drift = 100 - sum(scaled.values())
    scaled['neutral'] = max(0, scaled['neutral'] + drift)
    return scaled


def simulate_page(
    llm: LLMClient,
    page: Dict[str, Any],
    headline: str,
    caption: Optional[str],
    n_personas: int,
) -> Dict[str, Any]:
    """Run one page's audience simulation. Returns a result dict, never raises."""
    handle = page['name']
    try:
        caption_block = f"Caption: {caption}\n" if caption else ""
        response = llm.chat_json(
            messages=[
                {"role": "system", "content": SIMULATION_SYSTEM_PROMPT},
                {"role": "user", "content": SIMULATION_USER_PROMPT.format(
                    handle=handle,
                    group=page.get('group', GROUP_OTHER),
                    headline=headline,
                    caption_block=caption_block,
                    n_personas=n_personas,
                )},
            ],
            temperature=0.8,
        )
        sentiment = _normalize_sentiment(response.get('sentiment'))
        try:
            score = max(0, min(100, int(round(float(response.get('engagement_score', 0))))))
        except (TypeError, ValueError):
            score = 0
        personas = []
        for p in (response.get('personas') or [])[:n_personas]:
            s = str(p.get('sentiment', 'neutral')).lower()
            personas.append({
                'name': str(p.get('name', '')),
                'occupation': str(p.get('occupation', '')),
                'mbti': str(p.get('mbti', '')),
                'comment': str(p.get('comment', '')),
                'sentiment': s if s in SENTIMENT_KEYS else 'neutral',
            })
        return {
            'page': handle,
            'group': page.get('group', GROUP_OTHER),
            'success': True,
            'audience_profile': str(response.get('audience_profile', '')),
            'verdict': str(response.get('verdict', '')),
            'engagement_score': score,
            'sentiment': sentiment,
            'top_objection': str(response.get('top_objection', '')),
            'personas': personas,
        }
    except Exception as e:  # noqa: BLE001 - one bad page must not sink the run
        logger.error(f"Ad reaction simulation failed for @{handle}: {e}")
        return {'page': handle, 'group': page.get('group', GROUP_OTHER),
                'success': False, 'error': str(e)}


def run_simulation(
    headline: str,
    page_names: List[str],
    caption: Optional[str] = None,
    personas_per_page: int = DEFAULT_PERSONAS_PER_PAGE,
) -> Dict[str, Any]:
    """Simulate the ad against each selected page concurrently and aggregate."""
    roster = {p['name'].lower(): p for p in get_roster()}
    selected = []
    for name in page_names[:MAX_PAGES_PER_RUN]:
        known = roster.get(name.strip().lower())
        selected.append(known or {'name': name.strip(), 'group': GROUP_OTHER, 'mentions': 1})

    personas_per_page = max(1, min(6, personas_per_page))
    llm = LLMClient()

    results: List[Dict[str, Any]] = []
    with ThreadPoolExecutor(max_workers=LLM_WORKERS) as pool:
        futures = {
            pool.submit(simulate_page, llm, page, headline, caption, personas_per_page): page
            for page in selected
        }
        for future in as_completed(futures):
            results.append(future.result())

    order = {p['name']: i for i, p in enumerate(selected)}
    results.sort(key=lambda r: order.get(r['page'], 99))

    ok = [r for r in results if r['success']]
    summary: Dict[str, Any] = {
        'pages_requested': len(selected),
        'pages_simulated': len(ok),
        'pages_failed': len(results) - len(ok),
    }
    if ok:
        summary['avg_engagement_score'] = int(round(
            sum(r['engagement_score'] for r in ok) / len(ok)))
        summary['sentiment'] = _normalize_sentiment({
            k: sum(r['sentiment'][k] for r in ok) / len(ok) for k in SENTIMENT_KEYS})
        advocates = summary['sentiment']['advocate'] + summary['sentiment']['positive']
        detractors = summary['sentiment']['skeptical'] + summary['sentiment']['hostile']
        summary['advocate_detractor_ratio'] = (
            round(advocates / detractors, 1) if detractors else None)

    return {'summary': summary, 'results': results}
