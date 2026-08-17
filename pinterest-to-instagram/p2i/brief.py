"""Turn a theme into a publishable carousel brief.

One call produces the whole post: which pin opens it, what order the rest run
in, the overlay text, the caption, the hashtags, the alt text, and an audio
brief. Doing it in one pass keeps the caption honest — it is written by
something that has just decided the running order, not bolted on afterwards.
"""

from __future__ import annotations

import json
from typing import Any

from anthropic import Anthropic

from .config import MODEL, Brand

BRIEF_SCHEMA = {
    "type": "object",
    "properties": {
        "title": {"type": "string", "description": "Cover title. Max 28 characters."},
        "subtitle": {"type": "string", "description": "Cover subtitle. Max 48 characters."},
        "cover_pin_id": {"type": "string"},
        "ordered_pin_ids": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Running order for the image slides, cover pin first.",
        },
        "slide_notes": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "pin_id": {"type": "string"},
                    "overlay": {
                        "type": "string",
                        "description": "Two to four words set on the slide. Empty string for none.",
                    },
                    "alt_text": {"type": "string", "description": "Accessible description, max 120 chars."},
                },
                "required": ["pin_id", "overlay", "alt_text"],
                "additionalProperties": False,
            },
        },
        "caption": {"type": "string"},
        "hashtags": {"type": "array", "items": {"type": "string"}},
        "audio_brief": {
            "type": "object",
            "properties": {
                "vibe": {"type": "string", "description": "One line describing the sound this set wants."},
                "search_terms": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Terms to type into Instagram's audio search.",
                },
                "avoid": {"type": "string", "description": "What would break the mood."},
            },
            "required": ["vibe", "search_terms", "avoid"],
            "additionalProperties": False,
        },
    },
    "required": [
        "title",
        "subtitle",
        "cover_pin_id",
        "ordered_pin_ids",
        "slide_notes",
        "caption",
        "hashtags",
        "audio_brief",
    ],
    "additionalProperties": False,
}


def build_brief(
    client: Anthropic,
    brand: Brand,
    theme: dict[str, Any],
    pins: list[dict[str, Any]],
) -> dict[str, Any]:
    """`pins` are the tagged pins belonging to this theme."""
    catalogue = [
        {"pin_id": p["pin_id"], **p["tags"]}
        for p in pins
    ]
    slide_budget = min(brand.max_slides - 1, len(catalogue))  # one slide is the cover card

    system = f"""You art-direct and write for {brand.name}.

Voice:
{brand.voice}

Audience:
{brand.audience}

Caption rules:
{chr(10).join('- ' + r for r in brand.caption_rules)}

You are building one carousel for the theme "{theme['name']}".
Its argument: {theme['argument']}

Sequencing:
- The cover pin is the one that reads at thumbnail size and leaves room for a
  title. High cover_potential matters more than being the prettiest image.
- After the cover, alternate scale — a wide frame, then a detail, then a wide
  frame. Do not run three similar crops together.
- Hold one strong image back for the final slide. The last frame is what people
  remember when they decide whether to follow.
- Use exactly {slide_budget} image slides. Drop the weakest pins if there are more.

Overlay text is optional and usually better absent. Use it only where a two-word
label genuinely adds something the image does not say.

Hashtags: choose {brand.hashtags_per_post}. Draw mostly from this pool, but you may
add up to three specific to this theme if the pool misses something real:
{', '.join(brand.hashtag_pool)}

For the audio brief: you cannot access Instagram's audio library, so do not
invent track or artist names. Describe the sound and give search terms a human
can type in."""

    response = client.messages.create(
        model=MODEL,
        max_tokens=16000,
        system=system,
        output_config={
            "effort": "high",
            "format": {"type": "json_schema", "schema": BRIEF_SCHEMA},
        },
        messages=[
            {
                "role": "user",
                "content": "Tagged pins available for this theme:\n\n"
                + json.dumps(catalogue, ensure_ascii=False),
            }
        ],
    )
    if response.stop_reason == "refusal":
        raise RuntimeError(f"Brief generation refused for theme {theme['name']}")

    brief = json.loads(_text(response))
    return _sanitise(brief, {p["pin_id"] for p in pins}, brand)


def _sanitise(brief: dict[str, Any], valid_ids: set[str], brand: Brand) -> dict[str, Any]:
    """Enforce the invariants the renderer and the Graph API depend on."""
    ordered = [pid for pid in dict.fromkeys(brief["ordered_pin_ids"]) if pid in valid_ids]

    cover = brief.get("cover_pin_id")
    if cover in ordered:
        ordered.remove(cover)
        ordered.insert(0, cover)
    elif ordered:
        brief["cover_pin_id"] = ordered[0]

    # One slot is spent on the cover card, so image slides cap one below the limit.
    brief["ordered_pin_ids"] = ordered[: brand.max_slides - 1]

    keep = set(brief["ordered_pin_ids"])
    brief["slide_notes"] = [n for n in brief["slide_notes"] if n["pin_id"] in keep]
    brief["hashtags"] = [
        h if h.startswith("#") else f"#{h}" for h in brief["hashtags"][: brand.hashtags_per_post]
    ]
    return brief


def _text(response: Any) -> str:
    for block in response.content:
        if block.type == "text":
            return block.text
    raise RuntimeError("No text block in response")
