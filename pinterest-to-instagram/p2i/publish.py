"""Two ways out: queue into Metricool for review, or publish straight to Instagram.

Both take the same input — a list of publicly reachable slide URLs plus the
caption — so you can switch adapters with one environment variable and change
nothing else.

Slides must be reachable over public HTTPS before either adapter runs: Meta and
Metricool both fetch media by URL rather than accepting an upload from you.
`upload_slides` shells out to whatever MEDIA_UPLOAD_CMD you set (aws s3 cp,
rclone, scp — anything), so the storage choice stays yours.
"""

from __future__ import annotations

import pathlib
import shlex
import subprocess
import time
from typing import Any, Protocol

import httpx

from .config import Settings


def upload_slides(settings: Settings, slug: str, slides: list[pathlib.Path]) -> list[str]:
    """Push rendered slides to public storage and return their URLs, in order."""
    if not settings.media_public_base_url:
        raise RuntimeError("MEDIA_PUBLIC_BASE_URL must be set before publishing.")

    urls = []
    for slide in slides:
        remote = f"{slug}/{slide.name}"
        if settings.media_upload_cmd:
            cmd = settings.media_upload_cmd.format(
                local=shlex.quote(str(slide)), remote=shlex.quote(remote)
            )
            subprocess.run(cmd, shell=True, check=True)
        urls.append(f"{settings.media_public_base_url}/{remote}")
    return urls


class Publisher(Protocol):
    def publish(self, slide_urls: list[str], caption: str, scheduled_for: str | None) -> str: ...


class MetricoolPublisher:
    """Queue the carousel into the Metricool planner.

    This is the adapter to use while a human still signs off on posts, and the
    only one that gives you a place to attach an audio track by hand before it
    goes out. Set METRICOOL_AUTO_PUBLISH=true once you trust the output.

    Metricool's REST API is documented in their help centre rather than a public
    OpenAPI spec, and they have changed path prefixes before — if a call 404s,
    check the paths below against your account's current API docs first.
    """

    MEDIA_PATH = "/v2/scheduler/media"
    POSTS_PATH = "/v2/scheduler/posts"

    def __init__(self, settings: Settings):
        settings.require("metricool_user_id", "metricool_user_token", "metricool_blog_id")
        self.settings = settings
        self.client = httpx.Client(base_url=settings.metricool_base_url, timeout=60.0)

    def _auth(self) -> dict[str, str]:
        return {
            "userId": self.settings.metricool_user_id,
            "userToken": self.settings.metricool_user_token,
            "blogId": self.settings.metricool_blog_id,
        }

    def _normalise_media(self, url: str) -> str:
        """Metricool copies remote media into its own storage and hands back an id."""
        resp = self.client.get(self.MEDIA_PATH, params={**self._auth(), "url": url})
        resp.raise_for_status()
        payload = resp.json()
        media_id = payload.get("data", payload).get("mediaId") or payload.get("id")
        if not media_id:
            raise RuntimeError(f"Metricool returned no mediaId for {url}: {payload}")
        return media_id

    def publish(self, slide_urls: list[str], caption: str, scheduled_for: str | None) -> str:
        media_ids = [self._normalise_media(u) for u in slide_urls]
        body = {
            "text": caption,
            "providers": [{"network": "instagram"}],
            "media": media_ids,
            "autoPublish": self.settings.metricool_auto_publish,
            "publicationDate": {
                "dateTime": scheduled_for,
                "timezone": self.settings.timezone,
            },
        }
        resp = self.client.post(self.POSTS_PATH, params=self._auth(), json=body)
        resp.raise_for_status()
        payload = resp.json()
        return str(payload.get("data", payload).get("id", "queued"))


class GraphPublisher:
    """Publish the carousel directly through the Instagram Content Publishing API.

    Requires an Instagram Business or Creator account linked to a Facebook Page,
    an app with instagram_basic + instagram_content_publish, and App Review for
    production. Limits worth knowing: 10 children per carousel, 100 API posts per
    rolling 24 hours, and no parameter for attaching a music track to a carousel.
    """

    def __init__(self, settings: Settings):
        settings.require("ig_user_id", "ig_access_token")
        self.settings = settings
        self.base = f"https://graph.facebook.com/{settings.ig_graph_version}"
        self.client = httpx.Client(timeout=120.0)

    def _post(self, path: str, data: dict[str, Any]) -> dict[str, Any]:
        resp = self.client.post(
            f"{self.base}/{path}", data={**data, "access_token": self.settings.ig_access_token}
        )
        if resp.status_code >= 400:
            raise RuntimeError(f"Graph API {resp.status_code} on {path}: {resp.text}")
        return resp.json()

    def _wait_for_container(self, container_id: str, timeout_s: int = 180) -> None:
        """Meta ingests media asynchronously; publishing too early fails the post."""
        deadline = time.time() + timeout_s
        while time.time() < deadline:
            resp = self.client.get(
                f"{self.base}/{container_id}",
                params={"fields": "status_code", "access_token": self.settings.ig_access_token},
            )
            resp.raise_for_status()
            status = resp.json().get("status_code")
            if status == "FINISHED":
                return
            if status in {"ERROR", "EXPIRED"}:
                raise RuntimeError(f"Media container {container_id} failed with status {status}")
            time.sleep(5)
        raise TimeoutError(f"Media container {container_id} never finished processing")

    def publish(self, slide_urls: list[str], caption: str, scheduled_for: str | None) -> str:
        if len(slide_urls) > 10:
            raise ValueError("Instagram carousels accept at most 10 items via the API.")
        if scheduled_for:
            raise ValueError(
                "The Graph API publishes immediately and has no scheduling parameter. "
                "Run this adapter from a scheduler, or use PUBLISH_ADAPTER=metricool."
            )

        children = []
        for url in slide_urls:
            child = self._post(
                f"{self.settings.ig_user_id}/media",
                {"image_url": url, "is_carousel_item": "true"},
            )
            children.append(child["id"])

        for child_id in children:
            self._wait_for_container(child_id)

        parent = self._post(
            f"{self.settings.ig_user_id}/media",
            {"media_type": "CAROUSEL", "children": ",".join(children), "caption": caption},
        )
        self._wait_for_container(parent["id"])

        published = self._post(
            f"{self.settings.ig_user_id}/media_publish", {"creation_id": parent["id"]}
        )
        return str(published["id"])


def get_publisher(settings: Settings) -> Publisher:
    adapter = settings.publish_adapter.lower()
    if adapter == "metricool":
        return MetricoolPublisher(settings)
    if adapter == "graph":
        return GraphPublisher(settings)
    raise ValueError(f"Unknown PUBLISH_ADAPTER: {settings.publish_adapter!r}")
