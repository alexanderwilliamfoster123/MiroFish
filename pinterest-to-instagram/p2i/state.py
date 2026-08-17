"""Local state: what we've seen, what we've grouped, what we've already posted.

Deliberately stores *derived* data only — pin IDs, our own tags, and image URLs
needed to re-render. Pinterest's platform terms restrict caching most API data,
so raw image bytes are downloaded into a temp directory at render time and
deleted immediately afterwards (see render.py).
"""

from __future__ import annotations

import json
import pathlib
import sqlite3
from contextlib import contextmanager
from datetime import date
from typing import Any, Iterator

SCHEMA = """
CREATE TABLE IF NOT EXISTS pins (
    pin_id       TEXT PRIMARY KEY,
    board_id     TEXT NOT NULL,
    image_url    TEXT NOT NULL,
    link         TEXT,
    note         TEXT,
    tags_json    TEXT,           -- vision output, NULL until tagged
    first_seen   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS carousels (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    theme        TEXT NOT NULL,
    slug         TEXT NOT NULL UNIQUE,
    brief_json   TEXT NOT NULL,  -- ordered pins, caption, hashtags, audio brief
    status       TEXT NOT NULL,  -- queued | rendered | scheduled | published | failed
    scheduled_for TEXT,
    external_ref TEXT,           -- Metricool post id or IG media id
    error        TEXT,
    created_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS used_pins (
    pin_id       TEXT NOT NULL,
    carousel_id  INTEGER NOT NULL,
    PRIMARY KEY (pin_id, carousel_id)
);
"""


class Store:
    def __init__(self, path: pathlib.Path):
        path.parent.mkdir(parents=True, exist_ok=True)
        self.conn = sqlite3.connect(path)
        self.conn.row_factory = sqlite3.Row
        self.conn.executescript(SCHEMA)
        self.conn.commit()

    @contextmanager
    def tx(self) -> Iterator[sqlite3.Connection]:
        try:
            yield self.conn
            self.conn.commit()
        except Exception:
            self.conn.rollback()
            raise

    # ---- pins -------------------------------------------------------------

    def upsert_pins(self, pins: list[dict[str, Any]]) -> int:
        """Insert pins we haven't seen. Returns the count of genuinely new ones."""
        today = date.today().isoformat()
        new = 0
        with self.tx() as conn:
            for p in pins:
                cur = conn.execute(
                    "INSERT OR IGNORE INTO pins "
                    "(pin_id, board_id, image_url, link, note, first_seen) "
                    "VALUES (?, ?, ?, ?, ?, ?)",
                    (p["pin_id"], p["board_id"], p["image_url"], p.get("link"), p.get("note"), today),
                )
                new += cur.rowcount
        return new

    def untagged_pins(self, limit: int = 200) -> list[dict[str, Any]]:
        rows = self.conn.execute(
            "SELECT * FROM pins WHERE tags_json IS NULL LIMIT ?", (limit,)
        ).fetchall()
        return [dict(r) for r in rows]

    def save_tags(self, pin_id: str, tags: dict[str, Any]) -> None:
        with self.tx() as conn:
            conn.execute(
                "UPDATE pins SET tags_json = ? WHERE pin_id = ?",
                (json.dumps(tags, ensure_ascii=False), pin_id),
            )

    def available_pins(self) -> list[dict[str, Any]]:
        """Tagged pins that have not been used in a carousel yet."""
        rows = self.conn.execute(
            "SELECT p.* FROM pins p "
            "LEFT JOIN used_pins u ON u.pin_id = p.pin_id "
            "WHERE p.tags_json IS NOT NULL AND u.pin_id IS NULL"
        ).fetchall()
        out = []
        for r in rows:
            d = dict(r)
            d["tags"] = json.loads(d.pop("tags_json"))
            out.append(d)
        return out

    def pins_by_id(self, pin_ids: list[str]) -> dict[str, dict[str, Any]]:
        if not pin_ids:
            return {}
        qs = ",".join("?" * len(pin_ids))
        rows = self.conn.execute(f"SELECT * FROM pins WHERE pin_id IN ({qs})", pin_ids).fetchall()
        return {r["pin_id"]: dict(r) for r in rows}

    # ---- carousels --------------------------------------------------------

    def queue_carousel(self, theme: str, slug: str, brief: dict[str, Any]) -> int | None:
        """Queue a carousel and mark its pins as used. Returns None if slug exists."""
        with self.tx() as conn:
            cur = conn.execute(
                "INSERT OR IGNORE INTO carousels (theme, slug, brief_json, status, created_at) "
                "VALUES (?, ?, ?, 'queued', ?)",
                (theme, slug, json.dumps(brief, ensure_ascii=False), date.today().isoformat()),
            )
            if cur.rowcount == 0:
                return None
            carousel_id = int(cur.lastrowid)
            for pin_id in brief["ordered_pin_ids"]:
                conn.execute(
                    "INSERT OR IGNORE INTO used_pins (pin_id, carousel_id) VALUES (?, ?)",
                    (pin_id, carousel_id),
                )
            return carousel_id

    def next_queued(self) -> dict[str, Any] | None:
        row = self.conn.execute(
            "SELECT * FROM carousels WHERE status = 'queued' ORDER BY id LIMIT 1"
        ).fetchone()
        if row is None:
            return None
        d = dict(row)
        d["brief"] = json.loads(d.pop("brief_json"))
        return d

    def mark(
        self,
        carousel_id: int,
        status: str,
        *,
        external_ref: str | None = None,
        scheduled_for: str | None = None,
        error: str | None = None,
    ) -> None:
        with self.tx() as conn:
            conn.execute(
                "UPDATE carousels SET status = ?, external_ref = COALESCE(?, external_ref), "
                "scheduled_for = COALESCE(?, scheduled_for), error = ? WHERE id = ?",
                (status, external_ref, scheduled_for, error, carousel_id),
            )

    def counts(self) -> dict[str, int]:
        rows = self.conn.execute(
            "SELECT status, COUNT(*) AS n FROM carousels GROUP BY status"
        ).fetchall()
        out = {r["status"]: r["n"] for r in rows}
        out["pins_total"] = self.conn.execute("SELECT COUNT(*) FROM pins").fetchone()[0]
        out["pins_untagged"] = self.conn.execute(
            "SELECT COUNT(*) FROM pins WHERE tags_json IS NULL"
        ).fetchone()[0]
        out["pins_available"] = len(self.available_pins())
        return out
