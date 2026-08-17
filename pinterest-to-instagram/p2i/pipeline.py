"""The pipeline. Five stages, each independently runnable and independently resumable.

    harvest  Pinterest boards      -> pins table
    tag      untagged pins         -> vision tags
    theme    tagged pins           -> themes -> queued carousel briefs
    build    one queued carousel   -> rendered slides on disk
    ship     rendered carousel     -> Metricool planner or Instagram

`daily()` runs the whole chain and is what the cron job calls.
"""

from __future__ import annotations

import json
import pathlib
from datetime import datetime, timedelta
from typing import Any
from zoneinfo import ZoneInfo

from anthropic import Anthropic

from . import brief as brief_mod
from . import themes as themes_mod
from . import vision
from .config import ROOT, Brand, Settings
from .pinterest import Pinterest
from .publish import get_publisher, upload_slides
from .render import render_carousel
from .state import Store


class Pipeline:
    def __init__(self, settings: Settings | None = None, brand: Brand | None = None):
        self.settings = settings or Settings()
        self.brand = brand or Brand.load()
        self.store = Store(self.settings.db_path)
        self._client: Anthropic | None = None

    @property
    def client(self) -> Anthropic:
        if self._client is None:
            self.settings.require("anthropic_api_key")
            self._client = Anthropic(api_key=self.settings.anthropic_api_key)
        return self._client

    # ---- stage 1: harvest -------------------------------------------------

    def harvest(self) -> int:
        self.settings.require("pinterest_token")
        with Pinterest(self.settings.pinterest_token) as api:
            pins = api.harvest(self.settings.pinterest_board_ids or None)
        new = self.store.upsert_pins(pins)
        print(f"harvest: {len(pins)} pins seen, {new} new")
        return new

    # ---- stage 2: tag -----------------------------------------------------

    def tag(self, limit: int = 200) -> int:
        pending = self.store.untagged_pins(limit)
        done = 0
        for pin in pending:
            try:
                tags = vision.tag_pin(self.client, pin["image_url"], pin.get("note"))
            except Exception as exc:  # one bad image must not stall the archive
                print(f"tag: skipped {pin['pin_id']}: {exc}")
                continue
            self.store.save_tags(pin["pin_id"], tags)
            done += 1
        print(f"tag: {done}/{len(pending)} pins tagged")
        return done

    # ---- stage 3: theme ---------------------------------------------------

    def theme(self, max_themes: int = 12) -> int:
        pins = self.store.available_pins()
        if len(pins) < self.brand.min_slides:
            print(f"theme: only {len(pins)} untouched pins available, need {self.brand.min_slides}")
            return 0

        found = themes_mod.group_into_themes(self.client, self.brand, pins, max_themes)
        by_id = {p["pin_id"]: p for p in pins}
        queued = 0

        for theme in found:
            theme_pins = [by_id[pid] for pid in theme["pin_ids"] if pid in by_id]
            try:
                brief = brief_mod.build_brief(self.client, self.brand, theme, theme_pins)
            except Exception as exc:
                print(f"theme: brief failed for {theme['name']}: {exc}")
                continue

            if len(brief["ordered_pin_ids"]) < self.brand.min_slides - 1:
                print(f"theme: {theme['name']} came back too thin, skipping")
                continue

            brief["theme"] = theme["name"]
            brief["argument"] = theme["argument"]
            slug = themes_mod.slugify(theme["name"])
            carousel_id = self.store.queue_carousel(theme["name"], slug, brief)
            if carousel_id is None:
                print(f"theme: {theme['name']} already queued, skipping")
                continue
            queued += 1
            print(f"theme: queued #{carousel_id} {theme['name']} ({len(brief['ordered_pin_ids']) + 1} slides)")

        return queued

    # ---- stage 4: build ---------------------------------------------------

    def build(self, carousel: dict[str, Any] | None = None) -> dict[str, Any] | None:
        carousel = carousel or self.store.next_queued()
        if carousel is None:
            print("build: nothing queued")
            return None

        brief = carousel["brief"]
        pins = self.store.pins_by_id(brief["ordered_pin_ids"])
        pin_urls = {pid: p["image_url"] for pid, p in pins.items()}
        out_dir = self.settings.out_dir / "carousels" / carousel["slug"]

        slides = render_carousel(
            self.brand, brief, pin_urls, out_dir, ROOT / "config" / "template.html"
        )
        (out_dir / "brief.json").write_text(
            json.dumps(brief, indent=2, ensure_ascii=False), encoding="utf-8"
        )
        self.store.mark(carousel["id"], "rendered")
        print(f"build: rendered {len(slides)} slides -> {out_dir}")

        carousel["slides"] = slides
        carousel["out_dir"] = out_dir
        return carousel

    # ---- stage 5: ship ----------------------------------------------------

    def ship(self, carousel: dict[str, Any]) -> str | None:
        brief = carousel["brief"]
        slides: list[pathlib.Path] = carousel["slides"]
        caption = _full_caption(brief)
        scheduled_for = (
            self.next_slot() if self.settings.publish_adapter.lower() == "metricool" else None
        )

        try:
            slide_urls = upload_slides(self.settings, carousel["slug"], slides)
            publisher = get_publisher(self.settings)
            ref = publisher.publish(slide_urls, caption, scheduled_for)
        except Exception as exc:
            self.store.mark(carousel["id"], "failed", error=str(exc))
            print(f"ship: failed for {carousel['slug']}: {exc}")
            return None

        status = "scheduled" if scheduled_for else "published"
        self.store.mark(carousel["id"], status, external_ref=ref, scheduled_for=scheduled_for)
        print(f"ship: {status} {carousel['slug']} (ref {ref})")
        _print_audio_brief(brief)
        return ref

    # ---- orchestration ----------------------------------------------------

    def daily(self, queue_floor: int = 3) -> None:
        self.harvest()
        self.tag()

        counts = self.store.counts()
        if counts.get("queued", 0) < queue_floor:
            self.theme()

        carousel = self.build()
        if carousel is not None:
            self.ship(carousel)

    def next_slot(self) -> str:
        """The next occurrence of POST_TIME_LOCAL, as an ISO 8601 local timestamp."""
        tz = ZoneInfo(self.settings.timezone)
        hour, minute = (int(x) for x in self.settings.post_time_local.split(":"))
        now = datetime.now(tz)
        slot = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
        if slot <= now:
            slot += timedelta(days=1)
        return slot.strftime("%Y-%m-%dT%H:%M:%S")

    def status(self) -> dict[str, int]:
        return self.store.counts()


def _full_caption(brief: dict[str, Any]) -> str:
    return f"{brief['caption']}\n\n{' '.join(brief['hashtags'])}"


def _print_audio_brief(brief: dict[str, Any]) -> None:
    """Audio is the one step that cannot be automated — surface it loudly.

    Neither the Graph API nor any scheduler can attach a track from Instagram's
    licensed audio library to a carousel. Someone opens the post in the app and
    taps the sound on. This prints what to search for when they do.
    """
    audio = brief.get("audio_brief") or {}
    print("\n  audio (manual step, ~15 seconds in the Instagram app)")
    print(f"    vibe:   {audio.get('vibe', '-')}")
    print(f"    search: {', '.join(audio.get('search_terms', []))}")
    print(f"    avoid:  {audio.get('avoid', '-')}\n")
