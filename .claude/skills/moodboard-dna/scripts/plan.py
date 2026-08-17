#!/usr/bin/env python3
"""Expand a brand DNA spec plus a campaign brief into a deterministic prompt matrix.

Every row is a fully composed prompt carrying the same style DNA, varied along
concept / aspect-ratio / framing / copy-space axes so a run yields a coherent
family rather than N near-duplicates. Output is shaped for generate_image_batch.

Usage:
    python3 plan.py <board_dir> --brief brief.json [--run-id r01] [--dry-run]
    python3 plan.py <board_dir> --count 24 --concepts "a" "b" "c"
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

BATCH_LIMIT = 12  # generate_image_batch accepts at most 12 requests per call.

# Rotating variation axes. Strides are chosen so concept/framing/copy-space
# combinations stay distinct across a 24-row run instead of realigning early.
FRAMINGS = [
    "wide establishing frame",
    "mid-distance three-quarter framing",
    "tight macro detail of a single surface",
    "elevated overhead flat-lay angle",
    "low angle looking upward",
    "eye-level straight-on frame",
    "off-centre frame with the subject at the edge",
]

COPY_SPACE = [
    "clean negative space across the upper third",
    "clean negative space across the lower third",
    "clean negative space down the left third",
    "clean negative space down the right third",
    "an uncluttered centre band",
    "clean negative space in the upper-left quadrant",
]

DEPTHS = [
    "shallow depth of field, background falling soft",
    "deep focus, the whole frame legible",
    "flattened perspective with compressed depth",
]


def load_json(path: Path) -> dict:
    try:
        return json.loads(path.read_text())
    except FileNotFoundError:
        print(f"error: missing {path}", file=sys.stderr)
        raise SystemExit(2)
    except json.JSONDecodeError as exc:
        print(f"error: {path} is not valid JSON: {exc}", file=sys.stderr)
        raise SystemExit(2)


def palette_clause(dna: dict) -> str:
    pal = dna.get("palette", {})
    parts = []
    for role, label in (("dominant", "dominant"), ("accent", "accent"), ("neutral", "neutral")):
        swatches = pal.get(role) or []
        if not swatches:
            continue
        rendered = ", ".join(
            f"{s['name']} {s['hex']}" if isinstance(s, dict) else str(s) for s in swatches
        )
        parts.append(f"{label} {rendered}")
    return "; ".join(parts)


def compose_prompt(dna: dict, concept: str, framing: str, copy_space: str, depth: str) -> str:
    """Assemble one prompt. Subject leads, style DNA follows, exclusions last."""
    segments: list[str] = [concept.rstrip(".")]

    if dna.get("subject_world"):
        segments.append(dna["subject_world"].rstrip("."))

    segments.append(f"{framing}, {depth}")
    segments.append(f"Composition: {dna.get('composition', 'balanced editorial layout').rstrip('.')}, leaving {copy_space} for headline copy")

    if palette_clause(dna):
        segments.append(f"Colour palette: {palette_clause(dna)}")
    for key, label in (("lighting", "Lighting"), ("texture", "Surface and texture"), ("grade", "Colour grade")):
        if dna.get(key):
            segments.append(f"{label}: {dna[key].rstrip('.')}")
    if dna.get("mood"):
        segments.append(f"Mood: {', '.join(dna['mood'])}")

    prompt = ". ".join(s.strip().rstrip(".") for s in segments if s and s.strip()) + "."

    if dna.get("anti_dna"):
        prompt += f" Avoid: {'; '.join(a.rstrip('.') for a in dna['anti_dna'])}."

    # A trained Element is injected by the backend wherever its placeholder sits;
    # leading with it anchors the whole frame to the moodboard.
    element_id = dna.get("element_id")
    if element_id:
        prompt = f"In the exact visual world of <<<{element_id}>>>: {prompt}"
    return prompt


def build_rows(dna: dict, brief: dict) -> list[dict]:
    concepts = brief.get("concepts") or []
    if not concepts:
        print("error: brief has no concepts", file=sys.stderr)
        raise SystemExit(2)

    count = int(brief.get("count", 24))
    ratios = brief.get("ratios") or ["4:5"]
    model = dna.get("model", "nano_banana_2")
    resolution = brief.get("resolution", "2k")

    rows = []
    for i in range(count):
        concept = concepts[i % len(concepts)]
        # Coprime-ish strides keep the axes from resynchronising across a run.
        framing = FRAMINGS[(i * 3) % len(FRAMINGS)]
        copy_space = COPY_SPACE[(i * 5) % len(COPY_SPACE)]
        depth = DEPTHS[i % len(DEPTHS)]
        ratio = ratios[i % len(ratios)]

        params: dict = {
            "model": model,
            "prompt": compose_prompt(dna, concept, framing, copy_space, depth),
            "aspect_ratio": ratio,
        }
        if resolution:
            params["resolution"] = resolution

        # Models that take the board as direct reference media rather than an Element.
        media_ids = dna.get("reference_media_ids") or []
        if media_ids and not dna.get("element_id"):
            params["medias"] = [{"value": mid, "role": "image"} for mid in media_ids]

        rows.append({
            "index": i,
            "concept": concept,
            "axes": {"framing": framing, "copy_space": copy_space, "depth": depth, "ratio": ratio},
            "params": params,
        })
    return rows


def main() -> int:
    ap = argparse.ArgumentParser(description="Expand brand DNA into a batch-ready prompt matrix.")
    ap.add_argument("board", type=Path, help="Moodboard directory holding dna.json")
    ap.add_argument("--brief", type=Path, help="Brief JSON (concepts, count, ratios, resolution)")
    ap.add_argument("--dna", type=Path, help="DNA spec path (default <board>/dna.json)")
    ap.add_argument("--count", type=int, help="Override asset count")
    ap.add_argument("--concepts", nargs="+", help="Inline concepts, instead of --brief")
    ap.add_argument("--ratios", nargs="+", help="Aspect ratios to cycle, e.g. 4:5 9:16 1:1")
    ap.add_argument("--run-id", help="Run identifier (default: UTC timestamp)")
    ap.add_argument("--dry-run", action="store_true", help="Print prompts without writing plan.json")
    args = ap.parse_args()

    board: Path = args.board.expanduser().resolve()
    dna = load_json(args.dna or board / "dna.json")

    brief: dict = load_json(args.brief) if args.brief else {}
    if args.concepts:
        brief["concepts"] = args.concepts
    if args.count:
        brief["count"] = args.count
    if args.ratios:
        brief["ratios"] = args.ratios
    brief.setdefault("count", 24)
    brief.setdefault("ratios", ["4:5"])

    rows = build_rows(dna, brief)
    batches = [
        [{"index": r["index"], "params": r["params"]} for r in rows[i: i + BATCH_LIMIT]]
        for i in range(0, len(rows), BATCH_LIMIT)
    ]

    run_id = args.run_id or datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    plan = {
        "board": dna.get("board", board.name),
        "run_id": run_id,
        "dna_version": dna.get("version", 1),
        "model": dna.get("model", "nano_banana_2"),
        "element_id": dna.get("element_id"),
        "campaign": brief.get("campaign"),
        "count": len(rows),
        "batch_count": len(batches),
        "rows": rows,
        "batches": batches,
    }

    if args.dry_run:
        for row in rows:
            print(f"--- [{row['index']:02d}] {row['axes']['ratio']}  {row['concept']}")
            print(row["params"]["prompt"])
            print()
        print(f"{len(rows)} prompts across {len(batches)} batch call(s) — not written (--dry-run)")
        return 0

    run_dir = board / "runs" / run_id
    run_dir.mkdir(parents=True, exist_ok=True)
    out = run_dir / "plan.json"
    out.write_text(json.dumps(plan, indent=2) + "\n")

    print(f"board {plan['board']}  run {run_id}")
    print(f"  {len(rows)} prompts, {len(batches)} batch call(s) of <= {BATCH_LIMIT}")
    print(f"  model {plan['model']}  element {plan['element_id'] or '(none - using reference medias)'}")
    print(f"  ratios {', '.join(sorted({r['axes']['ratio'] for r in rows}))}")
    print(f"\nwrote {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
