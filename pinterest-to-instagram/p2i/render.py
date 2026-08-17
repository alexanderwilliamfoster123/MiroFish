"""Render a brief into Instagram-sized PNGs.

The layout lives in config/template.html and is driven by config/brand.yaml's
`design` block. Design the look once in Figma, port it to that template, and
this step stops needing a human.

Source images are inlined as data URIs so the headless browser never makes a
network request, and the bytes are held only for the seconds it takes to
screenshot them — Pinterest's platform terms restrict caching their media, so
nothing here is written to disk except the finished slides.
"""

from __future__ import annotations

import base64
import mimetypes
import os
import pathlib
from typing import Any

import httpx
from jinja2 import Template
from playwright.sync_api import sync_playwright

from .config import Brand


def render_carousel(
    brand: Brand,
    brief: dict[str, Any],
    pin_urls: dict[str, str],
    out_dir: pathlib.Path,
    template_path: pathlib.Path,
) -> list[pathlib.Path]:
    """Returns the rendered slide paths in posting order."""
    out_dir.mkdir(parents=True, exist_ok=True)
    template = Template(template_path.read_text(encoding="utf-8"))

    width = int(brand.carousel.get("width", 1080))
    height = int(brand.carousel.get("height", 1350))
    overlays = {n["pin_id"]: n.get("overlay", "") for n in brief["slide_notes"]}
    ordered = brief["ordered_pin_ids"]

    data_uris = {pid: _fetch_data_uri(pin_urls[pid]) for pid in ordered}
    total = len(ordered) + 1  # image slides plus the cover card

    pages: list[dict[str, Any]] = [
        {
            "kind": "cover",
            "cover_image": data_uris[brief["cover_pin_id"]],
            "title": brief["title"],
            "subtitle": brief["subtitle"],
        }
    ]
    for i, pin_id in enumerate(ordered, start=2):
        pages.append(
            {
                "kind": "slide",
                "image": data_uris[pin_id],
                "overlay": overlays.get(pin_id, ""),
                "index": i,
            }
        )

    # Set CHROMIUM_EXECUTABLE when the image ships its own Chromium rather than
    # the build `playwright install` would fetch (most slim containers do).
    launch_kwargs: dict[str, Any] = {}
    chromium_path = os.environ.get("CHROMIUM_EXECUTABLE", "").strip()
    if chromium_path:
        launch_kwargs["executable_path"] = chromium_path

    written: list[pathlib.Path] = []
    with sync_playwright() as pw:
        browser = pw.chromium.launch(**launch_kwargs)
        page = browser.new_page(viewport={"width": width, "height": height})
        try:
            for i, ctx in enumerate(pages):
                html = template.render(
                    width=width, height=height, total=total, d=brand.design, **ctx
                )
                page.set_content(html, wait_until="load")
                target = out_dir / f"{i:02d}.png"
                page.screenshot(path=str(target))
                written.append(target)
        finally:
            browser.close()

    return written


def _fetch_data_uri(url: str) -> str:
    if url.startswith("data:"):
        return url
    with httpx.Client(timeout=60.0, follow_redirects=True) as client:
        resp = client.get(url)
        resp.raise_for_status()
    media_type = resp.headers.get("content-type", "").split(";")[0].strip()
    if not media_type.startswith("image/"):
        media_type = mimetypes.guess_type(url)[0] or "image/jpeg"
    return f"data:{media_type};base64,{base64.b64encode(resp.content).decode('ascii')}"
