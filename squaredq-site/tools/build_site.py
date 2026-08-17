#!/usr/bin/env python3
"""Assemble squaredq-site/index.html from the template, fonts and media.

Everything the page needs is inlined as a data URI, so the built file makes no
network requests and can be dropped on any static host — or into a sandbox that
blocks external origins.

    python3 tools/build_site.py

Inputs
    src/index.template.html      markup + styles + behaviour, with {{TOKEN}} slots
    src/*.woff2                  the three faces the page uses
    tools/brand/*.svg            wordmark, app mark, newsletter logotype
    media/hero-N.mp4             encoded background loops (see encode_media.py)
    media/hero-N.jpg             their poster frames
"""
import argparse
import base64
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
MEDIA = ROOT / "media"
BRAND = ROOT / "tools" / "brand"
OUT = ROOT / "index.html"

MIME = {".woff2": "font/woff2", ".svg": "image/svg+xml",
        ".mp4": "video/mp4", ".jpg": "image/jpeg", ".webp": "image/webp"}


def data_uri(path: pathlib.Path) -> str:
    path = pathlib.Path(path)
    if not path.exists():
        sys.exit("missing input: %s" % path)
    mime = MIME[path.suffix]
    return "data:%s;base64,%s" % (mime, base64.b64encode(path.read_bytes()).decode("ascii"))


# Shared inline SVG fragments. Kept here rather than in the template so the
# markup stays readable — they repeat a dozen times between them.
CHECK = ('<svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" '
         'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'
         '<path d="M13.3 4 6 11.3 2.7 8"/></svg>')
ARROW = ('<svg viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" '
         'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'
         '<path d="M3 10h14M11.5 4.5 17 10l-5.5 5.5"/></svg>')


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("-o", "--out", default=str(OUT), help="output file")
    ap.add_argument("--no-remote", action="store_true",
                    help="omit clips that are only available by URL, so the build "
                         "makes no network requests at all (sandboxes, offline demos)")
    args = ap.parse_args()

    tokens = {
        "FONT_SANS_400": data_uri(SRC / "the-future-400.woff2"),
        "FONT_SANS_500": data_uri(SRC / "the-future-500.woff2"),
        "FONT_SERIF_400": data_uri(SRC / "tiempos-400.woff2"),
        "WORDMARK_URI": data_uri(BRAND / "squaredq-wordmark.svg"),
        "MARK_URI": data_uri(BRAND / "squaredq-mark.svg"),
        "WEEKLY_URI": data_uri(BRAND / "sq-weekly.svg"),
        "CHECK": CHECK,
        "ARROW": ARROW,
    }
    # Each background clip is inlined when its encoded file is present, and
    # referenced by URL when it is not. A build with every file present is fully
    # self-contained; a build without them still ships, and the CSS atmosphere
    # bed carries any section whose clip cannot load.
    manifest = {c["index"]: c for c in json.loads((MEDIA / "sources.json").read_text())["clips"]}
    inlined = 0
    for n in range(1, 6):
        mp4, jpg = MEDIA / ("hero-%d.mp4" % n), MEDIA / ("hero-%d.jpg" % n)
        if mp4.exists():
            tokens["VIDEO_%d" % n] = data_uri(mp4)
            inlined += 1
        else:
            url = manifest.get(n, {}).get("url")
            tokens["VIDEO_%d" % n] = "" if args.no_remote else (url or "")
        tokens["POSTER_%d" % n] = data_uri(jpg) if jpg.exists() else ""
    print("clips inlined: %d/5%s" % (inlined, "" if inlined == 5 else "  (rest referenced by URL — see media/sources.json)"))

    html = (SRC / "index.template.html").read_text(encoding="utf-8")
    html = re.sub(r"\{\{([A-Z0-9_]+)\}\}", lambda m: tokens[m.group(1)], html)

    html = re.sub(r'\s(?:poster|src)=""', "", html)
    html = re.sub(r"<source\s*>\s*", "", html)

    left = re.findall(r"\{\{[A-Z0-9_]+\}\}", html)
    assert not left, "unresolved tokens: %s" % set(left)

    dest = pathlib.Path(args.out)
    dest.write_text(html, encoding="utf-8")

    print("%-28s %7.2f MB" % (dest.name, len(html.encode()) / 1e6))
    for name, uri in sorted(tokens.items()):
        if uri.startswith("data:"):
            print("  %-16s %7.2f MB" % (name, len(uri) / 1e6))


if __name__ == "__main__":
    main()
