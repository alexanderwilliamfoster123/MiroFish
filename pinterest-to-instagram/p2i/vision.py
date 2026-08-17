"""Look at each pin and describe it in the vocabulary the theming pass needs.

One Claude call per pin, images passed by URL. Runs at low effort — this is
perception and description, not reasoning, and it is the highest-volume step in
the pipeline.
"""

from __future__ import annotations

import json
from typing import Any

from anthropic import Anthropic

from .config import MODEL

TAG_SCHEMA = {
    "type": "object",
    "properties": {
        "subject": {"type": "string", "description": "What the image is of, in 2-6 words."},
        "palette": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Three dominant colours as #RRGGBB hex.",
        },
        "palette_words": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Three plain-language colour words, e.g. 'bone', 'rust', 'slate'.",
        },
        "mood": {"type": "array", "items": {"type": "string"}},
        "materials": {"type": "array", "items": {"type": "string"}},
        "composition": {"type": "string"},
        "light": {"type": "string"},
        "cover_potential": {
            "type": "integer",
            "description": "1-10. How well this works as the first frame of a carousel: "
            "graphic, legible at thumbnail size, room for a title.",
        },
        "quality": {
            "type": "integer",
            "description": "1-10 overall craft and resolution. Low for screenshots, "
            "watermarks, collages, or anything visibly compressed.",
        },
        "one_line": {"type": "string", "description": "One sentence a stylist would write."},
    },
    "required": [
        "subject",
        "palette",
        "palette_words",
        "mood",
        "materials",
        "composition",
        "light",
        "cover_potential",
        "quality",
        "one_line",
    ],
    "additionalProperties": False,
}

SYSTEM = (
    "You catalogue visual reference material for an art director. "
    "Describe what is actually in the frame using the vocabulary of styling and "
    "art direction — material, light, palette, composition. Do not editorialise, "
    "do not guess at brands or people, and do not describe text you cannot read clearly."
)


def tag_pin(client: Anthropic, image_url: str, note: str | None = None) -> dict[str, Any]:
    prompt: list[dict[str, Any]] = [
        {"type": "image", "source": {"type": "url", "url": image_url}},
        {"type": "text", "text": "Catalogue this reference image."},
    ]
    if note:
        prompt.append({"type": "text", "text": f"The saver's own note on it: {note}"})

    response = client.messages.create(
        model=MODEL,
        max_tokens=2000,
        system=SYSTEM,
        output_config={
            "effort": "low",
            "format": {"type": "json_schema", "schema": TAG_SCHEMA},
        },
        messages=[{"role": "user", "content": prompt}],
    )
    if response.stop_reason == "refusal":
        raise RuntimeError(f"Tagging refused for {image_url}")
    return json.loads(_text(response))


def _text(response: Any) -> str:
    for block in response.content:
        if block.type == "text":
            return block.text
    raise RuntimeError("No text block in response")
