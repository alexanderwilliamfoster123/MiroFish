"""Pinterest API v5 reader.

Scope required on the access token: `boards:read` and `pins:read`. Trial-tier
access is enough — we only ever read boards the token's own account owns.
Docs: https://developers.pinterest.com/docs/api/v5/
"""

from __future__ import annotations

from typing import Any, Iterator

import httpx

API = "https://api.pinterest.com/v5"


class Pinterest:
    def __init__(self, access_token: str, timeout: float = 30.0):
        self.client = httpx.Client(
            base_url=API,
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=timeout,
        )

    def close(self) -> None:
        self.client.close()

    def __enter__(self) -> "Pinterest":
        return self

    def __exit__(self, *exc: object) -> None:
        self.close()

    def _paginate(self, path: str, params: dict[str, Any] | None = None) -> Iterator[dict]:
        params = dict(params or {})
        params.setdefault("page_size", 100)
        bookmark: str | None = None
        while True:
            if bookmark:
                params["bookmark"] = bookmark
            resp = self.client.get(path, params=params)
            resp.raise_for_status()
            payload = resp.json()
            yield from payload.get("items", [])
            bookmark = payload.get("bookmark")
            if not bookmark:
                return

    def boards(self) -> list[dict[str, Any]]:
        return [
            {"board_id": b["id"], "name": b.get("name", ""), "pin_count": b.get("pin_count", 0)}
            for b in self._paginate("/boards")
        ]

    def board_pins(self, board_id: str) -> list[dict[str, Any]]:
        """Normalise Pinterest's pin payload down to what the pipeline needs."""
        out: list[dict[str, Any]] = []
        for pin in self._paginate(f"/boards/{board_id}/pins"):
            image_url = _largest_image(pin)
            if not image_url:
                continue  # video pins and unrenderable pins are skipped
            out.append(
                {
                    "pin_id": pin["id"],
                    "board_id": board_id,
                    "image_url": image_url,
                    "link": pin.get("link"),
                    "note": (pin.get("title") or pin.get("description") or "").strip() or None,
                }
            )
        return out

    def harvest(self, board_ids: list[str] | None = None) -> list[dict[str, Any]]:
        ids = board_ids or [b["board_id"] for b in self.boards()]
        pins: list[dict[str, Any]] = []
        for board_id in ids:
            pins.extend(self.board_pins(board_id))
        return pins


def _largest_image(pin: dict[str, Any]) -> str | None:
    """Pin media comes back as a dict of size-keyed variants ('600x', '1200x', ...)."""
    images = (pin.get("media") or {}).get("images") or {}
    if not images:
        return None

    def width(key: str) -> int:
        head = key.split("x")[0]
        return int(head) if head.isdigit() else 0

    best = max(images, key=width)
    return images[best].get("url")
