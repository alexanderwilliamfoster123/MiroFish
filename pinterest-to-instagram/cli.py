#!/usr/bin/env python3
"""Command line entry point.

Building carousels:

    python cli.py harvest          pull pins from your Pinterest boards
    python cli.py tag              describe untagged pins with Claude vision
    python cli.py theme            group tagged pins into carousel briefs
    python cli.py build            render the next queued carousel to PNGs
    python cli.py ship             render and publish/schedule the next carousel
    python cli.py daily            the whole chain — this is what cron runs
    python cli.py status           counts by stage

Archiving Instagram:

    python cli.py download         bulk-download your own account's media
    python cli.py discover NAME    public media for another business/creator account
"""

from __future__ import annotations

import argparse
import json
import pathlib
import sys

from p2i.config import Settings
from p2i.ig_archive import InstagramArchive
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

    p_dl = sub.add_parser("download", help="bulk-download your own Instagram media")
    p_dl.add_argument("--dest", default="out/ig-archive")
    p_dl.add_argument("--limit", type=int, default=None, help="stop after N posts")
    p_dl.add_argument("--redownload", action="store_true", help="do not skip existing files")

    p_disc = sub.add_parser("discover", help="public media for another business/creator account")
    p_disc.add_argument("username")

    args = parser.parse_args()

    if args.command in {"download", "discover"}:
        return _instagram(args)

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


def _instagram(args: argparse.Namespace) -> int:
    settings = Settings()
    with InstagramArchive(settings) as archive:
        if args.command == "discover":
            data = archive.business_discovery(args.username.lstrip("@"))
            print(json.dumps(data, indent=2, ensure_ascii=False))
            return 0

        dest = pathlib.Path(args.dest)
        print(f"downloading to {dest.resolve()}")
        stats = archive.download_all(
            dest, max_items=args.limit, skip_existing=not args.redownload
        )
        print(
            f"\n{stats['posts']} posts | {stats['files']} files downloaded | "
            f"{stats['skipped']} already present | {stats['failed']} failed"
        )
        print(f"metadata: {dest / 'manifest.jsonl'}")
        return 1 if stats["failed"] else 0


if __name__ == "__main__":
    sys.exit(main())
