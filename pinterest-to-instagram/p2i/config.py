"""Configuration loading: environment for secrets, brand.yaml for taste."""

from __future__ import annotations

import os
import pathlib
from dataclasses import dataclass, field
from typing import Any

import yaml
from dotenv import load_dotenv

ROOT = pathlib.Path(__file__).resolve().parent.parent

load_dotenv(ROOT / ".env")


def _env(name: str, default: str = "") -> str:
    return os.environ.get(name, default).strip()


def _env_bool(name: str, default: bool = False) -> bool:
    raw = _env(name)
    if not raw:
        return default
    return raw.lower() in {"1", "true", "yes", "on"}


@dataclass
class Brand:
    """The taste layer. Loaded from config/brand.yaml."""

    name: str
    voice: str
    audience: str
    caption_rules: list[str]
    hashtag_pool: list[str]
    hashtags_per_post: int
    seed_themes: list[dict[str, str]]
    carousel: dict[str, Any]
    design: dict[str, Any]

    @property
    def max_slides(self) -> int:
        # The Graph API rejects carousels with more than 10 children, so this is
        # a hard ceiling regardless of what brand.yaml asks for.
        return min(int(self.carousel.get("max_slides", 10)), 10)

    @property
    def min_slides(self) -> int:
        return int(self.carousel.get("min_slides", 8))

    @classmethod
    def load(cls, path: pathlib.Path | None = None) -> "Brand":
        path = path or ROOT / "config" / "brand.yaml"
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
        return cls(
            name=data["name"],
            voice=data["voice"].strip(),
            audience=data["audience"].strip(),
            caption_rules=list(data.get("caption_rules", [])),
            hashtag_pool=list(data.get("hashtag_pool", [])),
            hashtags_per_post=int(data.get("hashtags_per_post", 10)),
            seed_themes=list(data.get("seed_themes", [])),
            carousel=dict(data.get("carousel", {})),
            design=dict(data.get("design", {})),
        )


@dataclass
class Settings:
    """Secrets and wiring. Loaded from the environment."""

    anthropic_api_key: str = field(default_factory=lambda: _env("ANTHROPIC_API_KEY"))

    pinterest_token: str = field(default_factory=lambda: _env("PINTEREST_ACCESS_TOKEN"))
    pinterest_board_ids: list[str] = field(
        default_factory=lambda: [b for b in _env("PINTEREST_BOARD_IDS").split(",") if b.strip()]
    )

    publish_adapter: str = field(default_factory=lambda: _env("PUBLISH_ADAPTER", "metricool"))

    metricool_user_id: str = field(default_factory=lambda: _env("METRICOOL_USER_ID"))
    metricool_user_token: str = field(default_factory=lambda: _env("METRICOOL_USER_TOKEN"))
    metricool_blog_id: str = field(default_factory=lambda: _env("METRICOOL_BLOG_ID"))
    metricool_base_url: str = field(
        default_factory=lambda: _env("METRICOOL_BASE_URL", "https://app.metricool.com/api")
    )
    metricool_auto_publish: bool = field(default_factory=lambda: _env_bool("METRICOOL_AUTO_PUBLISH"))

    ig_user_id: str = field(default_factory=lambda: _env("IG_USER_ID"))
    ig_access_token: str = field(default_factory=lambda: _env("IG_ACCESS_TOKEN"))
    ig_graph_version: str = field(default_factory=lambda: _env("IG_GRAPH_VERSION", "v21.0"))

    media_public_base_url: str = field(
        default_factory=lambda: _env("MEDIA_PUBLIC_BASE_URL").rstrip("/")
    )
    media_upload_cmd: str = field(default_factory=lambda: _env("MEDIA_UPLOAD_CMD"))

    post_time_local: str = field(default_factory=lambda: _env("POST_TIME_LOCAL", "09:00"))
    timezone: str = field(default_factory=lambda: _env("TIMEZONE", "Europe/London"))

    out_dir: pathlib.Path = field(default_factory=lambda: ROOT / "out")
    db_path: pathlib.Path = field(default_factory=lambda: ROOT / "out" / "state.db")

    def require(self, *names: str) -> None:
        """Fail loudly and early rather than three API calls later."""
        missing = [n for n in names if not getattr(self, n)]
        if missing:
            raise RuntimeError(
                "Missing required configuration: "
                + ", ".join(sorted(missing))
                + ". Copy .env.example to .env and fill it in."
            )


MODEL = "claude-opus-5"
