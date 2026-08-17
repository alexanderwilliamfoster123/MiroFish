#!/usr/bin/env python3
"""Command line entry point.

    python cli.py harvest          pull pins from your Pinterest boards
    python cli.py tag              describe untagged pins with Claude vision
    python cli.py theme            group tagged pins into carousel briefs
    python cli.py build            render the next queued carousel to PNGs
    python cli.py ship             render and publish/schedule the next carousel
    python cli.py daily            the whole chain — this is what cron runs
    python cli.py status           counts by stage
"""

from __future__ import annotations

import argparse
import json
import sys

from p2i.pipeline import Pipeline


def main() -> int:
    parser = argparse.ArgumentParser(prog="p2i", description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("harvest")
    p_tag = sub.add_parser("tag")
    p_tag.add_argument("--limit", type=int, default=200)
    p_theme = sub.add_parser("theme")
    p_theme.add_argument("--max-themes", type=int, default=12)
    sub.add_parser("build")
    sub.add_parser("ship")
    p_daily = sub.add_parser("daily")
    p_daily.add_argument("--queue-floor", type=int, default=3)
    sub.add_parser("status")

    args = parser.parse_args()
    pipeline = Pipeline()

    if args.command == "harvest":
        pipeline.harvest()
    elif args.command == "tag":
        pipeline.tag(limit=args.limit)
    elif args.command == "theme":
        pipeline.theme(max_themes=args.max_themes)
    elif args.command == "build":
        if pipeline.build() is None:
            return 1
    elif args.command == "ship":
        carousel = pipeline.build()
        if carousel is None:
            return 1
        if pipeline.ship(carousel) is None:
            return 1
    elif args.command == "daily":
        pipeline.daily(queue_floor=args.queue_floor)
    elif args.command == "status":
        print(json.dumps(pipeline.status(), indent=2))

    return 0


if __name__ == "__main__":
    sys.exit(main())
