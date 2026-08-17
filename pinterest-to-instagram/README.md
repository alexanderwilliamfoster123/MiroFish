# Pinterest boards → themed Instagram carousels

Turns your Pinterest archive into daily theme-page carousels. Every step is
automated except one: attaching the audio track.

```
Pinterest boards ──▶ tag ──▶ theme ──▶ brief ──▶ render ──▶ schedule ──▶ Instagram
   API v5          Claude   Claude    Claude   Playwright  Metricool /
                   vision                                   Graph API
```

- **tag** — every pin is catalogued by a vision model: palette, materials, light,
  composition, and two scores (how well it works as a cover, how good the file is).
- **theme** — the tag catalogue is grouped into theme pages. A group only becomes a
  page if the images share a stated visual argument, not just a colour.
- **brief** — one call per theme decides the cover, the running order, the overlay
  text, the caption, the hashtags, the alt text, and the audio direction.
- **render** — slides are drawn from `config/template.html` at 1080×1350 by headless
  Chromium. This is where your Figma layout lives, ported once.
- **schedule** — either queued into the Metricool planner for review, or published
  straight to Instagram via the Graph API.

Pins are consumed once. A pin used in a carousel never appears in another, so the
archive drains rather than repeating itself.

## What is genuinely automated, and what is not

| Step | Status |
|---|---|
| Pulling pins from your boards | Automated (Pinterest API v5) |
| Categorising by palette / material / mood | Automated (Claude vision) |
| Deciding which pins form a theme | Automated |
| Choosing the cover and the running order | Automated |
| Rendering slides in your layout | Automated (Playwright) |
| Writing the caption and hashtags | Automated |
| Scheduling and posting | Automated (Metricool or Graph API) |
| **Attaching a trending audio track** | **Manual — ~15 seconds in the app** |

Audio is the one real gap, and it is a platform limit rather than an
implementation shortcut. No public API exposes Instagram's licensed music
library, and the Content Publishing API has no parameter for attaching a track
to a carousel — schedulers including Metricool are bound by the same API. Reels
can carry original audio you upload; carousels cannot carry a library track
without a human tapping it on.

So the pipeline does the next best thing: every brief ships with an audio brief —
the vibe, the terms to type into Instagram's audio search, and what would break
the mood. It prints to the console after shipping and is saved in each
carousel's `brief.json`. If you use `PUBLISH_ADAPTER=metricool`, the post sits in
the planner where the track can be added before it goes out.

Two other platform limits worth knowing before you design around them:

- **10 slides, not 12.** Instagram's in-app composer takes 20 images; the
  publishing API takes 10 per carousel. `max_slides` in `brand.yaml` is clamped
  to 10 — one slot is the cover card, so you get 9 images plus a cover.
- **Pinterest restricts caching their data.** Nothing here stores pin images.
  They are fetched at render time, inlined into the page, screenshotted, and
  dropped. Only pin IDs, image URLs, and our own tags are persisted.

## Setup

```bash
pip install -r requirements.txt
playwright install chromium          # or set CHROMIUM_EXECUTABLE to your own
cp .env.example .env                 # then fill it in
```

You need:

1. **Pinterest** — a business account and an approved app at
   [developers.pinterest.com](https://developers.pinterest.com/docs/api/v5/).
   Trial access is enough for reading your own boards; both tiers are free.
   Scopes: `boards:read`, `pins:read`.
2. **Claude** — an API key from [platform.claude.com](https://platform.claude.com).
3. **One publishing route:**
   - *Metricool* (recommended to start) — API credentials from Settings → API.
     Posts land in the planner as drafts, so you review and add audio before they
     go out. Metricool also ships an [MCP server](https://github.com/metricool/mcp-metricool)
     if you would rather drive it from Claude directly.
   - *Instagram Graph API* — a Business or Creator account linked to a Facebook
     Page, an app with `instagram_basic` and `instagram_content_publish`, and App
     Review for production. Publishes immediately, no review step, 100 posts per
     rolling 24 hours.
4. **Public storage for slides** — both routes fetch media by URL rather than
   accepting an upload, so rendered slides must sit behind public HTTPS. Set
   `MEDIA_PUBLIC_BASE_URL`, and `MEDIA_UPLOAD_CMD` to whatever moves files there:

   ```
   MEDIA_UPLOAD_CMD=aws s3 cp {local} s3://my-bucket/carousels/{remote} --acl public-read
   ```

## Running it

```bash
python smoke_test.py     # no API keys needed — checks the render path and store
python cli.py harvest    # pull pins from your boards
python cli.py tag        # catalogue untagged pins
python cli.py theme      # group them into carousel briefs
python cli.py build      # render the next queued carousel to out/carousels/<slug>/
python cli.py ship       # render and schedule/publish it
python cli.py status     # counts by stage
python cli.py daily      # the whole chain — what cron runs
```

Start with `harvest` → `tag` → `theme` → `build`, then look at the PNGs in
`out/carousels/` before you connect anything to a real account.

### Daily schedule

`daily` harvests, tags, tops the queue back up when it falls below three
carousels, then builds and ships one. Run it once a day:

```
0 8 * * *  cd /srv/pinterest-to-instagram && python cli.py daily >> daily.log 2>&1
```

A GitHub Actions equivalent is in `deploy/github-actions.yml`.

## Tuning it

Almost everything you will want to change lives in `config/brand.yaml`:

- `voice`, `audience`, `caption_rules` — how captions read.
- `hashtag_pool`, `hashtags_per_post` — the tag set to draw from.
- `seed_themes` — theme pages you already know you want. The theming pass prefers
  these when pins genuinely fit, and invents new ones when they do not.
- `carousel` — slide count and dimensions.
- `design` — palette, fonts, insets, footer. These feed straight into
  `config/template.html`, so change the YAML before you touch the HTML.

To restyle the slides properly, edit `config/template.html` and re-run
`python smoke_test.py` — it renders a full carousel from synthetic images in a
few seconds with no API calls.

## Cost

Roughly, at current list prices, for a 1,000-pin archive:

- Tagging: one low-effort vision call per pin, one time only. The bulk of the
  spend, and it does not recur — new pins are tagged as they appear.
- Theming: one call per run over tags only, no images.
- Briefs: one call per carousel.

Steady state, once the archive is tagged, is a handful of calls a day.

## Files

```
cli.py                    entry point
smoke_test.py             offline check of the render path and store
config/brand.yaml         voice, hashtags, themes, slide design
config/template.html      the slide layout
p2i/pinterest.py          API v5 reader
p2i/vision.py             per-pin cataloguing
p2i/themes.py             grouping into theme pages
p2i/brief.py              cover, order, caption, hashtags, audio brief
p2i/render.py             HTML → 1080×1350 PNGs
p2i/publish.py            Metricool and Graph API adapters
p2i/pipeline.py           the five stages and the daily chain
p2i/state.py              sqlite: pins seen, pins used, carousels queued
```
