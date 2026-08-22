"""Bulk-download an Instagram account's own media through the Graph API.

Scope note, because this is the part people get wrong: the Graph API only ever
hands you media for accounts that have authorised your app. There is no
sanctioned endpoint for downloading someone else's personal account, and the
Basic Display API that used to allow personal-account reads was switched off on
4 December 2024. `business_discovery` below is the one legitimate way to read
another account, it only works for Business/Creator accounts, and it returns
public fields only.

Two things bite people here:

  1. `media_url` is a short-lived signed CDN URL. It is not a permalink and it
     expires. Fetch the page and download the bytes in the same pass — storing
     the URL to download "later" gives you a directory of 403s.
  2. `/media` returns at most the 10,000 most recent items, and never Stories.
     If the account is older or bigger than that, use Meta's own account export
     (see README) for the tail.
"""

from __future__ import annotations

import json
import pathlib
import re
import time
from typing import Any, Iterator

import httpx

from .config import Settings

# Everything worth having on a media object. `children` covers carousel slides,
# which are separate media objects with their own URLs.
MEDIA_FIELDS = ",".join(
    [
        "id",
        "caption",
        "media_type",
        "media_product_type",
        "media_url",
        "permalink",
        "thumbnail_url",
        "timestamp",
        "username",
        "like_count",
        "comments_count",
        "children{id,media_type,media_url,thumbnail_url}",
    ]
)

EXTENSIONS = {"IMAGE": ".jpg", "VIDEO": ".mp4", "CAROUSEL_ALBUM": ".jpg"}


class InstagramArchive:
    def __init__(self, settings: Settings):
        settings.require("ig_user_id", "ig_access_token")
        self.settings = settings
        self.base = f"https://graph.facebook.com/{settings.ig_graph_version}"
        self.client = httpx.Client(timeout=60.0, follow_redirects=True)

    def close(self) -> None:
        self.client.close()

    def __enter__(self) -> "InstagramArchive":
        return self

    def __exit__(self, *exc: object) -> None:
        self.close()

    # ---- listing ----------------------------------------------------------

    def media(self, page_size: int = 100, max_items: int | None = None) -> Iterator[dict[str, Any]]:
        """Walk the account's media newest-first, following cursor pagination."""
        url = f"{self.base}/{self.settings.ig_user_id}/media"
        params: dict[str, Any] = {
            "fields": MEDIA_FIELDS,
            "limit": page_size,
            "access_token": self.settings.ig_access_token,
        }
        seen = 0
        while url:
            resp = self.client.get(url, params=params)
            if resp.status_code == 429:
                # 200 calls per hour per IG account. Back off rather than die
                # halfway through an archive run.
                time.sleep(60)
                continue
            if resp.status_code >= 400:
                raise RuntimeError(f"Graph API {resp.status_code}: {resp.text}")
            payload = resp.json()

            for item in payload.get("data", []):
                yield item
                seen += 1
                if max_items and seen >= max_items:
                    return

            url = (payload.get("paging") or {}).get("next")
            params = {}  # the `next` URL already carries fields, cursor and token

    def business_discovery(self, username: str, page_size: int = 50) -> dict[str, Any]:
        """Public media for another *Business or Creator* account.

        The only sanctioned way to read an account that has not authorised your
        app. Personal accounts return nothing. Fields are a strict subset — no
        media_url on some item types, no insights, no follower lists.
        """
        resp = self.client.get(
            f"{self.base}/{self.settings.ig_user_id}",
            params={
                "fields": (
                    f"business_discovery.username({username})"
                    f"{{followers_count,media_count,media.limit({page_size})"
                    f"{{id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count}}}}"
                ),
                "access_token": self.settings.ig_access_token,
            },
        )
        if resp.status_code >= 400:
            raise RuntimeError(f"business_discovery failed for @{username}: {resp.text}")
        return resp.json().get("business_discovery", {})

    # ---- downloading ------------------------------------------------------

    def download_all(
        self,
        dest: pathlib.Path,
        max_items: int | None = None,
        skip_existing: bool = True,
    ) -> dict[str, int]:
        """Download every media file, foldered by month, with a JSONL manifest.

        Resumable: with skip_existing, a re-run only fetches what is missing, so
        an interrupted archive picks up where it stopped.
        """
        dest.mkdir(parents=True, exist_ok=True)
        manifest_path = dest / "manifest.jsonl"
        stats = {"posts": 0, "files": 0, "skipped": 0, "failed": 0}

        with manifest_path.open("a", encoding="utf-8") as manifest:
            for post in self.media(max_items=max_items):
                stats["posts"] += 1
                month = (post.get("timestamp") or "unknown")[:7]
                folder = dest / month
                folder.mkdir(parents=True, exist_ok=True)

                targets = _targets(post)
                saved: list[str] = []
                for name, url in targets:
                    path = folder / name
                    if skip_existing and path.exists() and path.stat().st_size > 0:
                        stats["skipped"] += 1
                        saved.append(str(path.relative_to(dest)))
                        continue
                    try:
                        self._download(url, path)
                        stats["files"] += 1
                        saved.append(str(path.relative_to(dest)))
                    except Exception as exc:
                        stats["failed"] += 1
                        print(f"  failed {name}: {exc}")

                record = {k: v for k, v in post.items() if k != "children"}
                record["files"] = saved
                manifest.write(json.dumps(record, ensure_ascii=False) + "\n")
                manifest.flush()

                if stats["posts"] % 25 == 0:
                    print(f"  {stats['posts']} posts, {stats['files']} files downloaded")

        return stats

    def _download(self, url: str, path: pathlib.Path) -> None:
        with self.client.stream("GET", url) as resp:
            resp.raise_for_status()
            tmp = path.with_suffix(path.suffix + ".part")
            with tmp.open("wb") as fh:
                for chunk in resp.iter_bytes(chunk_size=65536):
                    fh.write(chunk)
            tmp.replace(path)  # never leave a half-written file looking complete


def _targets(post: dict[str, Any]) -> list[tuple[str, str]]:
    """Flatten a post into (filename, url) pairs, expanding carousel children."""
    post_id = re.sub(r"[^A-Za-z0-9_-]", "", str(post.get("id", "unknown")))
    children = (post.get("children") or {}).get("data") or []

    if children:
        out = []
        for i, child in enumerate(children, start=1):
            url = child.get("media_url")
            if url:
                ext = EXTENSIONS.get(child.get("media_type", "IMAGE"), ".jpg")
                out.append((f"{post_id}_{i:02d}{ext}", url))
        return out

    url = post.get("media_url") or post.get("thumbnail_url")
    if not url:
        return []
    return [(f"{post_id}{EXTENSIONS.get(post.get('media_type', 'IMAGE'), '.jpg')}", url)]
