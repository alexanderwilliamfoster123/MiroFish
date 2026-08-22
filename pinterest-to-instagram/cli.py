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
    python cli.py hashtag TAG      public media carrying a hashtag
    python cli.py oembed URL       one public post by URL (no token needed)
"""

from __future__ import annotations

import argparse
import json
import pathlib
import sys

from p2i.config import Settings
from p2i.ig_archive import InstagramArchive
from p2i.ig_discover import Discover
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
    p_disc.add_argument("--save", metavar="DIR", help="download the results with attribution")

    p_hash = sub.add_parser("hashtag", help="public media carrying a hashtag")
    p_hash.add_argument("tag")
    p_hash.add_argument("--kind", choices=["top", "recent"], default="top")
    p_hash.add_argument("--limit", type=int, default=50)
    p_hash.add_argument("--save", metavar="DIR", help="download the results with attribution")

    p_oe = sub.add_parser("oembed", help="one public post by URL")
    p_oe.add_argument("url")

    args = parser.parse_args()

    if args.command in {"download", "discover", "hashtag", "oembed"}:
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

    if args.command == "download":
        with InstagramArchive(settings) as archive:
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

    with Discover(settings) as discover:
        if args.command == "oembed":
            print(json.dumps(discover.oembed(args.url), indent=2, ensure_ascii=False))
            return 0

        if args.command == "discover":
            data = discover.account(args.username.lstrip("@"))
            items = (data.get("media") or {}).get("data", [])
            print(
                f"@{data.get('username', args.username)} | "
                f"{data.get('followers_count', '?')} followers | "
                f"{data.get('media_count', '?')} posts | {len(items)} returned"
            )
        else:
            items = discover.hashtag_media(args.tag, kind=args.kind, limit=args.limit)
            print(f"#{args.tag.lstrip('#')} ({args.kind}) | {len(items)} returned")
            if args.kind == "recent" and not items:
                print("  recent_media only covers the last 24 hours — try --kind top")

        if not args.save:
            print(json.dumps(items, indent=2, ensure_ascii=False))
            return 0

        dest = pathlib.Path(args.save)
        stats = discover.save_reference(items, dest)
        print(
            f"\n{stats['saved']} saved | {stats['skipped']} skipped (no media URL or "
            f"already present) | {stats['failed']} failed"
        )
        print(f"credits: {dest / 'attribution.jsonl'}")
        print("These files belong to the people who posted them — keep the credit line.")
        return 1 if stats["failed"] else 0


if __name__ == "__main__":
    sys.exit(main())
