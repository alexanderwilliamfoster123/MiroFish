#!/usr/bin/env python3
"""Offline check of everything that does not need an API key.

Exercises the store, the brief invariants, and the full render path with
synthetic images, so you can iterate on config/brand.yaml and the slide template
without spending Pinterest quota or Claude tokens.

    python smoke_test.py        # writes slides to out/smoke/
"""

from __future__ import annotations

import pathlib
import shutil
import sys
import tempfile

from p2i.brief import _sanitise
from p2i.config import ROOT, Brand
from p2i.render import render_carousel
from p2i.state import Store

SWATCHES = [
    "#B4553A", "#7C8B7A", "#D9CFC1", "#3A3F45", "#A98B6F",
    "#5E6B73", "#C9A227", "#2E2A26", "#E3DACE", "#8F5A4E",
]


def fake_image(colour: str, label: str) -> str:
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1500">'
        f'<rect width="100%" height="100%" fill="{colour}"/>'
        f'<text x="60" y="1420" font-family="monospace" font-size="64" fill="#ffffff88">{label}</text>'
        f"</svg>"
    )
    import base64

    return "data:image/svg+xml;base64," + base64.b64encode(svg.encode()).decode()


def main() -> int:
    brand = Brand.load()
    print(f"brand: {brand.name}, slides {brand.min_slides}-{brand.max_slides}")

    pins = [
        {"pin_id": f"pin{i}", "board_id": "b1", "image_url": fake_image(c, f"pin{i}"), "note": None}
        for i, c in enumerate(SWATCHES)
    ]

    # --- store round trip ---
    tmp = pathlib.Path(tempfile.mkdtemp(prefix="p2i-smoke-"))
    try:
        store = Store(tmp / "state.db")
        assert store.upsert_pins(pins) == len(pins), "first insert should be all new"
        assert store.upsert_pins(pins) == 0, "re-inserting the same pins must be a no-op"
        for p in pins:
            store.save_tags(p["pin_id"], {"subject": "swatch", "quality": 8, "cover_potential": 7})
        assert len(store.available_pins()) == len(pins)

        brief = {
            "title": "Terracotta & Lime",
            "subtitle": "Mineral surfaces, low sun",
            "cover_pin_id": "pin3",
            "ordered_pin_ids": [p["pin_id"] for p in pins] + ["ghost-pin"],
            "slide_notes": [
                {"pin_id": p["pin_id"], "overlay": "matte lime" if i % 3 == 0 else "", "alt_text": "x"}
                for i, p in enumerate(pins)
            ],
            "caption": "Nine surfaces that hold the same light.",
            "hashtags": ["moodboard", "#texturestudy"],
            "audio_brief": {"vibe": "warm, slow", "search_terms": ["ambient"], "avoid": "drums"},
        }
        brief = _sanitise(brief, {p["pin_id"] for p in pins}, brand)

        # invariants the renderer and the Graph API depend on
        assert "ghost-pin" not in brief["ordered_pin_ids"], "unknown pin ids must be dropped"
        assert brief["ordered_pin_ids"][0] == "pin3", "cover pin must lead the running order"
        assert len(brief["ordered_pin_ids"]) <= brand.max_slides - 1, "one slot is the cover card"
        assert all(h.startswith("#") for h in brief["hashtags"]), "hashtags must be normalised"
        print(f"brief: ok, {len(brief['ordered_pin_ids']) + 1} slides")

        carousel_id = store.queue_carousel("Terracotta & Lime", "terracotta-lime", brief)
        assert carousel_id is not None
        assert store.queue_carousel("Terracotta & Lime", "terracotta-lime", brief) is None, (
            "the same theme must not queue twice"
        )
        still_free = {p["pin_id"] for p in store.available_pins()}
        assert still_free.isdisjoint(brief["ordered_pin_ids"]), (
            "queued pins must leave the available pool"
        )
        assert still_free, "pins not used by the carousel stay available for the next theme"
        print("store: ok")

        # --- render ---
        out_dir = ROOT / "out" / "smoke"
        shutil.rmtree(out_dir, ignore_errors=True)
        pin_urls = {p["pin_id"]: p["image_url"] for p in pins}
        slides = render_carousel(brand, brief, pin_urls, out_dir, ROOT / "config" / "template.html")

        expected = len(brief["ordered_pin_ids"]) + 1
        assert len(slides) == expected, f"expected {expected} slides, got {len(slides)}"
        w, h = brand.carousel["width"], brand.carousel["height"]
        for s in slides:
            assert s.stat().st_size > 1000, f"{s} looks empty"
        print(f"render: ok, {len(slides)} slides at {w}x{h} -> {out_dir}")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)

    print("\nall checks passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
