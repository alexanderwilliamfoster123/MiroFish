"""
Local OpenAI-compatible shim for demo purposes.
Serves pre-authored audience-reaction fixtures (written by Claude in-session)
so the real MiroFish Ad Reaction Studio can run end-to-end in a sandbox
without an external LLM key. Response shape mimics /v1/chat/completions.
"""
import json
import re
import time
from flask import Flask, request, jsonify

app = Flask(__name__)

FIXTURES = {
  "theaifield": {
    "audience_profile": "AI-curious professionals and founders who follow daily AI news and tool roundups.",
    "verdict": "Relevant enough to stop the scroll, but this audience has seen a hundred 'get famous fast' pitches and wants proof.",
    "engagement_score": 62,
    "sentiment": {"advocate": 18, "positive": 34, "neutral": 26, "skeptical": 17, "hostile": 5},
    "top_objection": "show a real placement",
    "personas": [
      {"name": "Arjun, 27", "occupation": "ML engineer · Bangalore", "mbti": "INTJ",
       "comment": "everyone's selling founders 'visibility' rn. link one actual tier-1 piece you placed and I'll believe it", "sentiment": "skeptical"},
      {"name": "Chloe, 31", "occupation": "AI startup founder · London", "mbti": "ENTJ",
       "comment": "48hrs to a proposal is a big claim but honestly the press gap is real, worth a call", "sentiment": "positive"},
      {"name": "Marta, 35", "occupation": "Product lead · Warsaw", "mbti": "ISTJ",
       "comment": "saved. we launch in Q4 and literally nobody knows we exist", "sentiment": "advocate"},
      {"name": "Dev, 24", "occupation": "CS grad student · Austin", "mbti": "INTP",
       "comment": "ads on this page getting more frequent ngl", "sentiment": "neutral"}
    ]
  },
  "futuretechnews.ai": {
    "audience_profile": "Tech-news readers who like futurism content; more spectators than buyers.",
    "verdict": "Reads as credible B2B, but most of this crowd follows for news, not services — interest without much intent.",
    "engagement_score": 55,
    "sentiment": {"advocate": 12, "positive": 30, "neutral": 35, "skeptical": 18, "hostile": 5},
    "top_objection": "not shopping for PR",
    "personas": [
      {"name": "Tomas, 29", "occupation": "Solutions engineer · Berlin", "mbti": "ISTP",
       "comment": "clean ad tbh. not my problem to solve but I know two founders who need this", "sentiment": "positive"},
      {"name": "Grace, 33", "occupation": "Tech blogger · Toronto", "mbti": "ENFP",
       "comment": "'impossible to ignore' is doing a lot of work here, what's the actual method", "sentiment": "skeptical"},
      {"name": "Sam, 26", "occupation": "IT analyst · Manchester", "mbti": "ISFJ",
       "comment": "tagged my cofounder", "sentiment": "advocate"},
      {"name": "Lena, 38", "occupation": "Ops manager · Oslo", "mbti": "ESTJ",
       "comment": "scrolling past but the black and white creative does stand out on this feed", "sentiment": "neutral"}
    ]
  },
  "entrepreneurinsights": {
    "audience_profile": "Founders, side-hustlers and aspiring entrepreneurs consuming business advice daily.",
    "verdict": "Best-fit audience of the run — the pain point is exactly theirs; the pushback is price and proof, not relevance.",
    "engagement_score": 74,
    "sentiment": {"advocate": 28, "positive": 36, "neutral": 20, "skeptical": 12, "hostile": 4},
    "top_objection": "what does it cost",
    "personas": [
      {"name": "Maya, 30", "occupation": "DTC founder · Miami", "mbti": "ENTJ",
       "comment": "we did $1M last year and still can't get a journalist to reply. DMing you", "sentiment": "advocate"},
      {"name": "Kwame, 34", "occupation": "Agency owner · Accra", "mbti": "ESTP",
       "comment": "good PR firms don't usually need to run ads... but the 48hr proposal thing is smart", "sentiment": "skeptical"},
      {"name": "Priya, 27", "occupation": "SaaS founder · Bangalore", "mbti": "INTJ",
       "comment": "earned media beats paid every time, this is the right pitch to this page", "sentiment": "positive"},
      {"name": "Josh, 23", "occupation": "Dropshipper · Leeds", "mbti": "ESFP",
       "comment": "probably costs more than my whole ad budget lol", "sentiment": "neutral"}
    ]
  },
  "datasciencebrain": {
    "audience_profile": "Data scientists and analysts here for technical memes and tutorials, not business services.",
    "verdict": "Off-topic for this feed — technically literate crowd, low purchase authority, mild ad fatigue.",
    "engagement_score": 41,
    "sentiment": {"advocate": 6, "positive": 20, "neutral": 40, "skeptical": 24, "hostile": 10},
    "top_objection": "wrong feed for this",
    "personas": [
      {"name": "Wei, 28", "occupation": "Data scientist · Singapore", "mbti": "INTP",
       "comment": "I follow this page for pandas jokes not PR ads", "sentiment": "skeptical"},
      {"name": "Ana, 31", "occupation": "Analytics lead · São Paulo", "mbti": "ISTJ",
       "comment": "our startup could actually use this but weird place to find it", "sentiment": "positive"},
      {"name": "Rob, 25", "occupation": "BI developer · Dublin", "mbti": "ISFP",
       "comment": "scroll", "sentiment": "hostile"},
      {"name": "Nina, 29", "occupation": "ML researcher · Zurich", "mbti": "INFJ",
       "comment": "the claim is unfalsifiable which bothers me more than it should", "sentiment": "neutral"}
    ]
  },
  "hoodclips": {
    "audience_profile": "Entertainment-first meme audience; young, ad-allergic, engagement comes as jokes or not at all.",
    "verdict": "A corporate B2B ad on a meme page — it will be scrolled past or roasted; any engagement is ironic.",
    "engagement_score": 31,
    "sentiment": {"advocate": 3, "positive": 10, "neutral": 34, "skeptical": 28, "hostile": 25},
    "top_objection": "corporate ad on a meme page",
    "personas": [
      {"name": "Trey, 20", "occupation": "College student · Atlanta", "mbti": "ESTP",
       "comment": "impossible to ignore?? watch me", "sentiment": "hostile"},
      {"name": "Des, 22", "occupation": "Barber · Chicago", "mbti": "ESFP",
       "comment": "why am I getting LinkedIn ads on hoodclips 😭", "sentiment": "skeptical"},
      {"name": "Jay, 24", "occupation": "Delivery driver · Houston", "mbti": "ISFP",
       "comment": "lowkey clean ad but wrong crowd gang", "sentiment": "neutral"},
      {"name": "Mia, 21", "occupation": "Retail · Detroit", "mbti": "ENFP",
       "comment": "the comments about to be funnier than the ad", "sentiment": "neutral"}
    ]
  },
  "dailywtfacts": {
    "audience_profile": "Casual trivia lovers of all ages; broad, passive-scrolling audience.",
    "verdict": "Neither loved nor hated — a generic-feeling business ad to a general audience; forgettable without a hook tied to the page's format.",
    "engagement_score": 44,
    "sentiment": {"advocate": 8, "positive": 22, "neutral": 44, "skeptical": 19, "hostile": 7},
    "top_objection": "nothing for me here",
    "personas": [
      {"name": "Karen, 41", "occupation": "Teacher · Phoenix", "mbti": "ESFJ",
       "comment": "fun fact: I am not a startup", "sentiment": "neutral"},
      {"name": "Omar, 26", "occupation": "Paramedic · Newark", "mbti": "ISTP",
       "comment": "my brother's been building an app for 2 years, sending this to him", "sentiment": "positive"},
      {"name": "Beth, 33", "occupation": "Nurse · Cardiff", "mbti": "ISFJ",
       "comment": "ads everywhere these days", "sentiment": "skeptical"},
      {"name": "Leo, 19", "occupation": "Student · Naples", "mbti": "ENFP",
       "comment": "if you make a wtf-fact about press coverage this would actually work here", "sentiment": "neutral"}
    ]
  }
}


@app.route('/v1/chat/completions', methods=['POST'])
def completions():
    body = request.get_json(force=True)
    user_msg = next((m['content'] for m in body.get('messages', []) if m.get('role') == 'user'), '')
    match = re.search(r'Instagram page handle: @(\S+)', user_msg)
    handle = (match.group(1) if match else '').lower()
    fixture = FIXTURES.get(handle)
    if fixture is None:
        # generic honest fallback for pages without an authored fixture
        fixture = {
            "audience_profile": f"Followers of @{handle} (no authored demo fixture).",
            "verdict": "Demo shim has no authored reaction for this page.",
            "engagement_score": 50,
            "sentiment": {"advocate": 10, "positive": 25, "neutral": 40, "skeptical": 18, "hostile": 7},
            "top_objection": "n/a (demo)",
            "personas": []
        }
    return jsonify({
        "id": "chatcmpl-demo",
        "object": "chat.completion",
        "created": int(time.time()),
        "model": body.get("model", "mirofish-demo"),
        "choices": [{
            "index": 0,
            "message": {"role": "assistant", "content": json.dumps(fixture)},
            "finish_reason": "stop"
        }],
        "usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
    })


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5099)
