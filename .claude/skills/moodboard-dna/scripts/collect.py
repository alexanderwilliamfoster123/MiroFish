#!/usr/bin/env python3
"""Download a finished run's assets and write a provenance index.

Every asset lands next to the prompt, DNA version and variation axes that
produced it, so a good frame can be traced back and re-run rather than guessed at.

Usage:
    python3 collect.py <board_dir>/runs/<run_id> --results results.json
    cat results.json | python3 collect.py <board_dir>/runs/<run_id> --results -

results.json accepts either shape:
    [{"index": 0, "url": "https://..."}, ...]
    {"results": [{"index": 0, "url": "https://...", "job_id": "..."}]}
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
import urllib.request
from pathlib import Path


def slugify(text: str, limit: int = 40) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return (slug[:limit].rstrip("-")) or "asset"


def load_results(source: str) -> list[dict]:
    raw = sys.stdin.read() if source == "-" else Path(source).read_text()
    data = json.loads(raw)
    if isinstance(data, dict):
        data = data.get("results") or data.get("jobs") or []
    if not isinstance(data, list):
        print("error: results must be a list, or an object with a 'results' list", file=sys.stderr)
        raise SystemExit(2)
    return data


def download(url: str, dest: Path) -> str | None:
    """Fetch one asset. Returns an error string, or None on success."""
    if shutil.which("curl"):
        proc = subprocess.run(
            ["curl", "-fsSL", "--retry", "3", "--retry-delay", "2", "-o", str(dest), url],
            capture_output=True, text=True,
        )
        if proc.returncode == 0:
            return None
        # Fall through to urllib: curl can fail on proxy specifics urllib handles.
        curl_err = (proc.stderr or "").strip() or f"curl exit {proc.returncode}"
    else:
        curl_err = "curl unavailable"

    try:
        with urllib.request.urlopen(url, timeout=60) as resp, dest.open("wb") as fh:
            shutil.copyfileobj(resp, fh)
        return None
    except Exception as exc:  # noqa: BLE001 - one bad URL must not abort the run
        return f"{curl_err}; urllib: {type(exc).__name__}: {exc}"


def main() -> int:
    ap = argparse.ArgumentParser(description="Download run assets and write a provenance index.")
    ap.add_argument("run_dir", type=Path, help="Run directory containing plan.json")
    ap.add_argument("--results", required=True, help="Results JSON path, or - for stdin")
    ap.add_argument("--no-download", action="store_true", help="Write the index only, keep remote URLs")
    args = ap.parse_args()

    run_dir: Path = args.run_dir.expanduser().resolve()
    plan_path = run_dir / "plan.json"
    if not plan_path.is_file():
        print(f"error: no plan.json in {run_dir}", file=sys.stderr)
        return 2

    plan = json.loads(plan_path.read_text())
    rows = {row["index"]: row for row in plan["rows"]}
    results = load_results(args.results)

    assets_dir = run_dir / "assets"
    if not args.no_download:
        assets_dir.mkdir(parents=True, exist_ok=True)

    collected, failures = [], []
    for item in results:
        idx = item.get("index")
        url = item.get("url") or item.get("result_url")
        row = rows.get(idx)
        if row is None:
            failures.append({"index": idx, "error": "index not present in plan.json"})
            continue
        if not url:
            failures.append({"index": idx, "error": item.get("status") or "no url in result"})
            continue

        suffix = Path(url.split("?")[0]).suffix or ".png"
        filename = f"{idx:02d}-{slugify(row['concept'])}{suffix}"
        record = {
            "index": idx,
            "file": filename,
            "url": url,
            "job_id": item.get("job_id"),
            "concept": row["concept"],
            "axes": row["axes"],
            "prompt": row["params"]["prompt"],
        }

        if not args.no_download:
            err = download(url, assets_dir / filename)
            if err:
                failures.append({"index": idx, "error": err})
                continue
            record["bytes"] = (assets_dir / filename).stat().st_size

        collected.append(record)

    collected.sort(key=lambda r: r["index"])
    (run_dir / "provenance.json").write_text(
        json.dumps({"board": plan["board"], "run_id": plan["run_id"],
                    "dna_version": plan.get("dna_version"), "model": plan.get("model"),
                    "assets": collected, "failures": failures}, indent=2) + "\n"
    )

    lines = [
        f"# {plan['board']} — run {plan['run_id']}",
        "",
        f"- **Campaign**: {plan.get('campaign') or '—'}",
        f"- **Model**: {plan.get('model')}",
        f"- **DNA version**: {plan.get('dna_version')}",
        f"- **Collected**: {len(collected)} of {plan.get('count')}",
        "",
    ]
    if failures:
        lines += ["## Failures", ""]
        lines += [f"- `{f['index']}` — {f['error']}" for f in failures] + [""]

    lines += ["## Assets", ""]
    for rec in collected:
        src = f"assets/{rec['file']}" if not args.no_download else rec["url"]
        lines += [
            f"### {rec['index']:02d} — {rec['concept']}",
            "",
            f"![{rec['concept']}]({src})",
            "",
            f"`{rec['axes']['ratio']}` · {rec['axes']['framing']} · {rec['axes']['copy_space']}",
            "",
            "<details><summary>Prompt</summary>",
            "",
            f"```\n{rec['prompt']}\n```",
            "",
            "</details>",
            "",
        ]
    (run_dir / "index.md").write_text("\n".join(lines))

    print(f"collected {len(collected)} asset(s) into {run_dir}")
    if failures:
        print(f"  {len(failures)} failure(s):")
        for f in failures:
            print(f"    [{f['index']}] {f['error']}")
    print(f"  index      {run_dir / 'index.md'}")
    print(f"  provenance {run_dir / 'provenance.json'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
