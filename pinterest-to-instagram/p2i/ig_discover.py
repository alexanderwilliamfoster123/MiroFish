"""Reading *other people's* public Instagram content, through sanctioned routes only.

There is no route that backfills someone else's account. The Basic Display API,
which was the closest thing, was switched off on 4 December 2024. What remains:

  business_discovery   recent public media for a named Business/Creator account
  hashtag media        public media carrying a hashtag — top (by engagement) or
                       recent (last 24h only)
  oEmbed               one public post by URL; tokenless since 15 June 2026

All three are read-only, public-only, and capped. They are discovery tools, not
mirrors. Everything here records `username` and `permalink` alongside the file,
because content pulled this way belongs to whoever posted it — if any of it ends
up on a page you publish, you need the attribution to hand and, for anything
beyond fair-use reference, the poster's permission.
"""

from __future__ import annotations

import json
import pathlib
import re
from typing import Any

import httpx

from .config import Settings

MEDIA_FIELDS = "id,caption,media_type,media_url,permalink,timestamp,username,like_count,comments_count"

# oEmbed is tokenless for public content as of 15 June 2026. A token still works
# and buys higher rate limits, so it is sent when one is configured.
OEMBED_URL = "https://graph.facebook.com/v25.0/instagram_oembed"


class Discover:
    def __init__(self, settings: Settings, cache_path: pathlib.Path | None = None):
        self.settings = settings
        self.base = f"https://graph.facebook.com/{settings.ig_graph_version}"
        self.client = httpx.Client(timeout=60.0, follow_redirects=True)
        # Hashtag lookups are the scarcest resource on the platform: 30 unique
        # tags per rolling 7 days, per Instagram account. IDs are stable, so
        # caching them is the difference between a usable tool and one that
        # burns its weekly budget on repeat lookups.
        self.cache_path = cache_path or settings.out_dir / "hashtag_ids.json"
        self._cache = self._load_cache()

    def close(self) -> None:
        self.client.close()

    def __enter__(self) -> "Discover":
        return self

    def __exit__(self, *exc: object) -> None:
        self.close()

    def _load_cache(self) -> dict[str, str]:
        if self.cache_path.exists():
            try:
                return json.loads(self.cache_path.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                return {}
        return {}

    def _save_cache(self) -> None:
        self.cache_path.parent.mkdir(parents=True, exist_ok=True)
        self.cache_path.write_text(json.dumps(self._cache, indent=2), encoding="utf-8")

    # ---- by account -------------------------------------------------------

    def account(self, username: str, limit: int = 50) -> dict[str, Any]:
        """Public media for a Business or Creator account. Personal accounts return nothing."""
        self.settings.require("ig_user_id", "ig_access_token")
        resp = self.client.get(
            f"{self.base}/{self.settings.ig_user_id}",
            params={
                "fields": (
                    f"business_discovery.username({username})"
                    f"{{username,followers_count,media_count,"
                    f"media.limit({limit}){{{MEDIA_FIELDS}}}}}"
                ),
                "access_token": self.settings.ig_access_token,
            },
        )
        if resp.status_code >= 400:
            raise RuntimeError(
                f"business_discovery failed for @{username} — it only works for "
                f"Business/Creator accounts: {resp.text}"
            )
        return resp.json().get("business_discovery", {})

    # ---- by hashtag -------------------------------------------------------

    def hashtag_id(self, tag: str) -> str:
        tag = tag.lstrip("#").lower()
        if tag in self._cache:
            return self._cache[tag]

        self.settings.require("ig_user_id", "ig_access_token")
        resp = self.client.get(
            f"{self.base}/ig_hashtag_search",
            params={
                "user_id": self.settings.ig_user_id,
                "q": tag,
                "access_token": self.settings.ig_access_token,
            },
        )
        if resp.status_code >= 400:
            raise RuntimeError(f"hashtag lookup failed for #{tag}: {resp.text}")
        data = resp.json().get("data") or []
        if not data:
            raise RuntimeError(f"no hashtag found for #{tag}")

        self._cache[tag] = data[0]["id"]
        self._save_cache()
        return self._cache[tag]

    def hashtag_media(self, tag: str, kind: str = "top", limit: int = 50) -> list[dict[str, Any]]:
        """`top` is ranked by engagement; `recent` only covers the last 24 hours."""
        if kind not in {"top", "recent"}:
            raise ValueError("kind must be 'top' or 'recent'")
        tag_id = self.hashtag_id(tag)
        resp = self.client.get(
            f"{self.base}/{tag_id}/{kind}_media",
            params={
                "user_id": self.settings.ig_user_id,
                "fields": MEDIA_FIELDS,
                "limit": limit,
                "access_token": self.settings.ig_access_token,
            },
        )
        if resp.status_code >= 400:
            raise RuntimeError(f"{kind}_media failed for #{tag}: {resp.text}")
        return resp.json().get("data", [])

    # ---- by post URL ------------------------------------------------------

    def oembed(self, post_url: str, maxwidth: int = 1080) -> dict[str, Any]:
        """One public post by URL. No token required since 15 June 2026.

        Returns embed HTML, author, and a thumbnail — this is Meta's *embedding*
        surface, so the intended use is displaying the post with attribution
        intact, not harvesting the image.
        """
        params: dict[str, Any] = {"url": post_url, "maxwidth": maxwidth, "omitscript": "true"}
        if self.settings.ig_access_token:
            params["access_token"] = self.settings.ig_access_token
        resp = self.client.get(OEMBED_URL, params=params)
        if resp.status_code >= 400:
            raise RuntimeError(f"oEmbed failed for {post_url} (is the post public?): {resp.text}")
        return resp.json()

    # ---- saving -----------------------------------------------------------

    def save_reference(self, items: list[dict[str, Any]], dest: pathlib.Path) -> dict[str, int]:
        """Download a result set with attribution recorded next to every file."""
        dest.mkdir(parents=True, exist_ok=True)
        stats = {"saved": 0, "skipped": 0, "failed": 0}

        with (dest / "attribution.jsonl").open("a", encoding="utf-8") as manifest:
            for item in items:
                url = item.get("media_url")
                if not url:
                    # Videos and some album items come back without a usable URL.
                    stats["skipped"] += 1
                    continue

                username = item.get("username") or "unknown"
                safe_user = re.sub(r"[^A-Za-z0-9_.-]", "", username)
                safe_id = re.sub(r"[^A-Za-z0-9_-]", "", str(item.get("id", "unknown")))
                ext = ".mp4" if item.get("media_type") == "VIDEO" else ".jpg"
                path = dest / f"{safe_user}_{safe_id}{ext}"

                if path.exists() and path.stat().st_size > 0:
                    stats["skipped"] += 1
                    continue

                try:
                    with self.client.stream("GET", url) as resp:
                        resp.raise_for_status()
                        tmp = path.with_suffix(path.suffix + ".part")
                        with tmp.open("wb") as fh:
                            for chunk in resp.iter_bytes(chunk_size=65536):
                                fh.write(chunk)
                        tmp.replace(path)
                    stats["saved"] += 1
                except Exception as exc:
                    stats["failed"] += 1
                    print(f"  failed {path.name}: {exc}")
                    continue

                manifest.write(
                    json.dumps(
                        {
                            "file": path.name,
                            "credit": f"@{username}",
                            "permalink": item.get("permalink"),
                            "caption": item.get("caption"),
                            "timestamp": item.get("timestamp"),
                            "like_count": item.get("like_count"),
                            "comments_count": item.get("comments_count"),
                        },
                        ensure_ascii=False,
                    )
                    + "\n"
                )
        return stats
