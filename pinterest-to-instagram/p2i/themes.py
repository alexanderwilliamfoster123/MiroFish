"""Group tagged pins into coherent theme pages.

This is the judgement step: a theme is only worth a carousel if the pins in it
share a visual argument, not just a colour. Runs on tags only — no images — so
it stays cheap even with a few thousand pins in the pool.
"""

from __future__ import annotations

import json
import re
from typing import Any

from anthropic import Anthropic

from .config import MODEL, Brand

THEMES_SCHEMA = {
    "type": "object",
    "properties": {
        "themes": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string", "description": "2-4 words. A page title, not a caption."},
                    "argument": {
                        "type": "string",
                        "description": "One sentence on what these images share that is "
                        "worth showing together. Must be specific enough to exclude "
                        "images that merely look nice.",
                    },
                    "pin_ids": {"type": "array", "items": {"type": "string"}},
                    "confidence": {"type": "integer", "description": "1-10 coherence of the group."},
                },
                "required": ["name", "argument", "pin_ids", "confidence"],
                "additionalProperties": False,
            },
        }
    },
    "required": ["themes"],
    "additionalProperties": False,
}


def group_into_themes(
    client: Anthropic,
    brand: Brand,
    pins: list[dict[str, Any]],
    max_themes: int = 12,
) -> list[dict[str, Any]]:
    catalogue = [
        {
            "pin_id": p["pin_id"],
            **{k: p["tags"][k] for k in ("subject", "palette_words", "mood", "materials", "light", "composition")},
            "cover_potential": p["tags"]["cover_potential"],
            "quality": p["tags"]["quality"],
        }
        for p in pins
    ]

    seeds = "\n".join(f"- {t['name']}: {t.get('note', '')}" for t in brand.seed_themes) or "(none)"

    system = f"""You are the art director for {brand.name}, building theme pages out of a
large reference archive.

The audience:
{brand.audience}

A theme earns a page only when the images share a visual argument someone could
state out loud — a material logic, a light condition, a compositional habit. A
shared colour alone is not an argument. Reject the merely pretty.

Existing named themes to prefer when a group genuinely fits one:
{seeds}

Rules:
- Each theme needs between {brand.min_slides} and {brand.max_slides} pins. Groups
  that cannot reach {brand.min_slides} strong pins do not become themes.
- A pin belongs to at most one theme. Leave weak pins out entirely; the archive
  will be re-grouped on the next run.
- Prefer fewer, sharper themes over more, looser ones. Return at most {max_themes}.
- Ignore pins with quality below 5 unless the theme is specifically about texture
  or degradation."""

    response = client.messages.create(
        model=MODEL,
        max_tokens=16000,
        system=system,
        output_config={
            "effort": "high",
            "format": {"type": "json_schema", "schema": THEMES_SCHEMA},
        },
        messages=[
            {
                "role": "user",
                "content": "Here is the tagged archive. Group it into theme pages.\n\n"
                + json.dumps(catalogue, ensure_ascii=False),
            }
        ],
    )
    if response.stop_reason == "refusal":
        raise RuntimeError("Theme grouping refused")

    themes = json.loads(_text(response))["themes"]
    valid_ids = {p["pin_id"] for p in pins}
    cleaned = []
    for theme in themes:
        # The model occasionally echoes an id that is not in the pool; drop those
        # rather than failing the run, then re-check the size floor.
        theme["pin_ids"] = [pid for pid in dict.fromkeys(theme["pin_ids"]) if pid in valid_ids]
        if len(theme["pin_ids"]) >= brand.min_slides:
            cleaned.append(theme)
    return cleaned


def slugify(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def _text(response: Any) -> str:
    for block in response.content:
        if block.type == "text":
            return block.text
    raise RuntimeError("No text block in response")
