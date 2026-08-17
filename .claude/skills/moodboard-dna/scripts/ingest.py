#!/usr/bin/env python3
"""Catalogue a moodboard folder and extract its measurable colour signature.

This handles the deterministic half of DNA extraction: which files are in the
board, their dimensions, a deduplicated hash list, and a quantised palette with
luminance/saturation statistics. The interpretive half (lighting, composition,
subject world) is done by reading the images directly.

Usage:
    python3 ingest.py <moodboard_dir> [--max-colors 8] [--json-only]

Writes <moodboard_dir>/ingest.json and prints a human summary.
"""

from __future__ import annotations

import argparse
import colorsys
import hashlib
import json
import struct
import sys
from pathlib import Path

IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".tif", ".tiff"}

# Directories inside a board that hold generated output, never source material.
SKIP_DIRS = {"runs", ".git", "__pycache__", "node_modules"}

# Coarse colour vocabulary so prompts can name a hex rather than only cite it.
COLOR_NAMES = [
    ("black", (0, 0, 0)), ("charcoal", (54, 57, 62)), ("slate", (112, 128, 144)),
    ("silver", (192, 192, 192)), ("white", (255, 255, 255)), ("bone", (232, 226, 213)),
    ("sand", (214, 193, 165)), ("tan", (180, 145, 105)), ("brown", (120, 85, 60)),
    ("maroon", (110, 40, 45)), ("red", (200, 45, 45)), ("coral", (240, 120, 100)),
    ("orange", (235, 140, 50)), ("amber", (240, 185, 70)), ("gold", (200, 165, 80)),
    ("yellow", (240, 225, 90)), ("olive", (128, 128, 60)), ("lime", (160, 205, 90)),
    ("green", (70, 150, 85)), ("forest", (40, 85, 60)), ("teal", (45, 130, 130)),
    ("petrol", (30, 70, 85)), ("cyan", (90, 195, 210)), ("sky", (135, 190, 230)),
    ("blue", (55, 105, 195)), ("navy", (28, 42, 80)), ("indigo", (75, 65, 145)),
    ("violet", (140, 100, 200)), ("purple", (110, 60, 130)), ("magenta", (200, 70, 160)),
    ("pink", (240, 155, 185)), ("blush", (235, 200, 195)), ("cream", (245, 238, 220)),
]


def nearest_color_name(rgb: tuple[int, int, int]) -> str:
    r, g, b = rgb
    return min(COLOR_NAMES, key=lambda c: (c[1][0] - r) ** 2 + (c[1][1] - g) ** 2 + (c[1][2] - b) ** 2)[0]


def hex_of(rgb: tuple[int, int, int]) -> str:
    return "#{:02X}{:02X}{:02X}".format(*rgb)


def stdlib_dimensions(path: Path) -> tuple[int, int] | None:
    """Read pixel dimensions from file headers without any third-party decoder."""
    try:
        with path.open("rb") as fh:
            head = fh.read(32)
            if head[:8] == b"\x89PNG\r\n\x1a\n":
                w, h = struct.unpack(">II", head[16:24])
                return int(w), int(h)
            if head[:6] in (b"GIF87a", b"GIF89a"):
                w, h = struct.unpack("<HH", head[6:10])
                return int(w), int(h)
            if head[:2] == b"BM":
                fh.seek(18)
                w, h = struct.unpack("<ii", fh.read(8))
                return abs(int(w)), abs(int(h))
            if head[:4] == b"RIFF" and head[8:12] == b"WEBP":
                fh.seek(12)
                chunk = fh.read(8)
                if chunk[:4] == b"VP8X":
                    body = fh.read(10)
                    w = 1 + int.from_bytes(body[4:7], "little")
                    h = 1 + int.from_bytes(body[7:10], "little")
                    return w, h
                return None
            if head[:2] == b"\xff\xd8":  # JPEG: walk the segment chain to SOFn.
                fh.seek(2)
                while True:
                    marker = fh.read(2)
                    if len(marker) < 2 or marker[0] != 0xFF:
                        return None
                    if marker[1] in range(0xC0, 0xCF) and marker[1] not in (0xC4, 0xC8, 0xCC):
                        fh.read(3)
                        h, w = struct.unpack(">HH", fh.read(4))
                        return int(w), int(h)
                    size = struct.unpack(">H", fh.read(2))[0]
                    fh.seek(size - 2, 1)
    except (OSError, struct.error):
        return None
    return None


def analyse_with_pillow(path: Path, max_colors: int) -> dict | None:
    """Quantised palette plus tone statistics. Returns None if Pillow is absent."""
    try:
        from PIL import Image
    except ImportError:
        return None

    try:
        with Image.open(path) as im:
            width, height = im.size
            rgb = im.convert("RGB")
            # Work on a thumbnail: palette structure survives, cost collapses.
            rgb.thumbnail((400, 400))
            quantised = rgb.quantize(colors=max_colors, method=Image.Quantize.MEDIANCUT)
            palette = quantised.getpalette() or []
            counts = sorted(quantised.getcolors() or [], key=lambda c: -c[0])
            total = sum(c for c, _ in counts) or 1

            swatches = []
            for count, idx in counts:
                r, g, b = palette[idx * 3: idx * 3 + 3]
                h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
                swatches.append({
                    "hex": hex_of((r, g, b)),
                    "name": nearest_color_name((r, g, b)),
                    "share": round(count / total, 4),
                    "lightness": round(l, 3),
                    "saturation": round(s, 3),
                })

            raw = rgb.tobytes()
            pixels = [(raw[i], raw[i + 1], raw[i + 2]) for i in range(0, len(raw), 3)]
            lum = [(0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 for r, g, b in pixels]
            sat = [colorsys.rgb_to_hls(r / 255, g / 255, b / 255)[2] for r, g, b in pixels]
            mean_lum = sum(lum) / len(lum)
            variance = sum((x - mean_lum) ** 2 for x in lum) / len(lum)

            return {
                "width": width,
                "height": height,
                "swatches": swatches,
                "mean_luminance": round(mean_lum, 3),
                "contrast": round(variance ** 0.5, 3),
                "mean_saturation": round(sum(sat) / len(sat), 3),
            }
    except Exception as exc:  # noqa: BLE001 - a single unreadable file must not abort the board
        return {"error": f"{type(exc).__name__}: {exc}"}


def collect_images(root: Path) -> list[Path]:
    found = []
    for path in sorted(root.rglob("*")):
        if not path.is_file() or path.suffix.lower() not in IMAGE_SUFFIXES:
            continue
        if any(part in SKIP_DIRS for part in path.relative_to(root).parts):
            continue
        found.append(path)
    return found


def aggregate_palette(images: list[dict], limit: int = 10) -> list[dict]:
    """Merge per-image swatches into a board-wide palette weighted by coverage."""
    buckets: dict[str, dict] = {}
    for img in images:
        for sw in img.get("swatches", []):
            # Bucket to a 32-step grid so near-identical shades converge.
            r, g, b = (int(sw["hex"][i: i + 2], 16) for i in (1, 3, 5))
            key = f"{r // 32}-{g // 32}-{b // 32}"
            entry = buckets.setdefault(key, {"r": 0.0, "g": 0.0, "b": 0.0, "share": 0.0})
            entry["r"] += r * sw["share"]
            entry["g"] += g * sw["share"]
            entry["b"] += b * sw["share"]
            entry["share"] += sw["share"]

    merged = []
    for entry in buckets.values():
        share = entry["share"] or 1
        merged.append({
            "rgb": (int(entry["r"] / share), int(entry["g"] / share), int(entry["b"] / share)),
            "share": entry["share"],
        })
    merged.sort(key=lambda s: -s["share"])

    # Grid bucketing splits shades that straddle a cell boundary, so collapse
    # anything still perceptually adjacent into the heavier of the pair.
    collapsed: list[dict] = []
    for cand in merged:
        for kept in collapsed:
            dist = sum((a - b) ** 2 for a, b in zip(cand["rgb"], kept["rgb"])) ** 0.5
            if dist < 24:
                total = kept["share"] + cand["share"]
                kept["rgb"] = tuple(
                    int((k * kept["share"] + c * cand["share"]) / total)
                    for k, c in zip(kept["rgb"], cand["rgb"])
                )
                kept["share"] = total
                break
        else:
            collapsed.append(dict(cand))

    collapsed.sort(key=lambda s: -s["share"])
    return [
        {
            "hex": hex_of(s["rgb"]),
            "name": nearest_color_name(s["rgb"]),
            "weight": round(s["share"] / max(len(images), 1), 4),
        }
        for s in collapsed[:limit]
    ]


def main() -> int:
    ap = argparse.ArgumentParser(description="Catalogue a moodboard folder and extract its colour signature.")
    ap.add_argument("board", type=Path, help="Directory holding the moodboard images")
    ap.add_argument("--max-colors", type=int, default=8, help="Swatches extracted per image (default 8)")
    ap.add_argument("--json-only", action="store_true", help="Print JSON to stdout instead of a summary")
    args = ap.parse_args()

    root: Path = args.board.expanduser().resolve()
    if not root.is_dir():
        print(f"error: not a directory: {root}", file=sys.stderr)
        return 2

    paths = collect_images(root)
    if not paths:
        print(f"error: no images found under {root}", file=sys.stderr)
        print(f"       supported: {', '.join(sorted(IMAGE_SUFFIXES))}", file=sys.stderr)
        return 1

    images, seen_hashes, duplicates = [], {}, []
    for path in paths:
        digest = hashlib.sha256(path.read_bytes()).hexdigest()[:16]
        rel = str(path.relative_to(root))
        if digest in seen_hashes:
            duplicates.append({"path": rel, "duplicate_of": seen_hashes[digest]})
            continue
        seen_hashes[digest] = rel

        record = {"path": rel, "sha256": digest, "bytes": path.stat().st_size}
        analysis = analyse_with_pillow(path, args.max_colors)
        if analysis and "error" not in analysis:
            record.update(analysis)
        else:
            dims = stdlib_dimensions(path)
            if dims:
                record["width"], record["height"] = dims
            record["degraded"] = (analysis or {}).get("error", "Pillow not installed - colour stats unavailable")
        images.append(record)

    analysed = [i for i in images if i.get("swatches")]
    report = {
        "board": root.name,
        "board_path": str(root),
        "image_count": len(images),
        "duplicates_skipped": duplicates,
        "images": images,
        "board_palette": aggregate_palette(analysed) if analysed else [],
        "board_stats": {
            "mean_luminance": round(sum(i["mean_luminance"] for i in analysed) / len(analysed), 3),
            "mean_saturation": round(sum(i["mean_saturation"] for i in analysed) / len(analysed), 3),
            "mean_contrast": round(sum(i["contrast"] for i in analysed) / len(analysed), 3),
        } if analysed else {},
    }

    out = root / "ingest.json"
    out.write_text(json.dumps(report, indent=2) + "\n")

    if args.json_only:
        print(json.dumps(report, indent=2))
        return 0

    print(f"board: {report['board']}  ({report['image_count']} unique images)")
    if duplicates:
        print(f"  skipped {len(duplicates)} duplicate(s): {', '.join(d['path'] for d in duplicates)}")
    if not analysed:
        print("  colour stats unavailable (install Pillow: python3 -m pip install pillow)")
    else:
        stats = report["board_stats"]
        print(f"  luminance {stats['mean_luminance']}  saturation {stats['mean_saturation']}  contrast {stats['mean_contrast']}")
        print("  board palette:")
        for sw in report["board_palette"]:
            print(f"    {sw['hex']}  {sw['name']:<9} weight {sw['weight']}")
    print(f"\nwrote {out}")
    print("\nnext: read these images to extract the interpretive DNA, then write dna.json")
    for img in images:
        print(f"  {root / img['path']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
