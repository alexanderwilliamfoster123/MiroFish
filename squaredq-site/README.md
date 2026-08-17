# SquaredQ — marketing site

Single-page marketing site for SquaredQ, an algorithmic trading software company.
Built from scratch: own layout, own copy, own brand assets, own generated media.

```bash
python3 tools/build_site.py            # -> index.html
python3 -m http.server -d . 8000       # local preview
```

`index.html` is the whole deliverable. Fonts, brand marks and icons are inlined,
there is no framework, no build toolchain at runtime and no third-party script.
Any static host works.

## Layout of the repo

```
src/index.template.html   markup, styles and behaviour with {{TOKEN}} slots
src/*.woff2               the three faces the page uses
tools/build_site.py       resolves the tokens -> index.html
tools/encode_media.py     raw clips -> seamless, size-budgeted web loops
tools/brand/*.svg         wordmark, Q² app mark, SQ Weekly logotype
media/sources.json        the five generated background clips and their prompts
media/hero-N.mp4|jpg      encoded loops + posters (absent = see "Background clips")
index.html                built output
```

## Design

Same DNA as the reference the team picked — editorial spacing, a modern serif
against a geometric sans, full-bleed media beds alternating with quiet paper
sections, a giant footer wordmark — pointed at a quant audience rather than a
consumer one.

| | |
|---|---|
| **Ink** | `#141318` — text and wordmark |
| **Paper / bone** | `#f5f3ef` / `#eae7e0` — section grounds |
| **Accent** | `#3a2fd8` — primary action only, never decoration |
| **Accent tint** | `#dedbf7` — the SQ Weekly panel |
| **Type** | `tiempos` for display, `the-future` 400/500 for everything else, system monospace for code |
| **Geometry** | 10px button radius — the one literal nod to the name |

The page commits to a single light-grounded treatment rather than shipping a
dark variant: `html` and `body` both paint an explicit background, so it holds
its own appearance on any host, including a dark-themed one.

## Background clips

The five section beds were generated with Higgsfield (`seedance_2_5`, 1080p, 5s,
silent, 16:9). The art direction is deliberately sculptural — lit CGI objects
with real depth of field, not the neon-grid trading-terminal cliché:

| # | Section | Subject |
|---|---|---|
| 1 | Hero | chrome and smoked-glass cubes settling into a rising staircase curve |
| 2 | Research | a field of glass rods refracting lavender caustics |
| 3 | Backtest | frosted-glass strata sliding into alignment |
| 4 | Execute | a steel sphere running a lattice of rails, trailing light |
| 5 | Risk | a taut membrane deforming under invisible weights |

Prompts and job IDs are in `media/sources.json`.

### Inlining them

`media/hero-N.mp4` is **not committed** — the environment this was built in
cannot reach the generation CDN (`d8j0ntlcm91z4.cloudfront.net` is not on its
egress allowlist), so the clips could not be downloaded and encoded here. The
build handles both states:

- **file present** → inlined as a data URI, page stays fully self-contained
- **file absent** → `<source>` points at the URL in `media/sources.json`

To finish the job on a machine that can reach the CDN:

```bash
mkdir -p media/raw
# download each clips[].url from media/sources.json to media/raw/hero-N.mp4
python3 tools/encode_media.py --all     # loop, downscale, budget, poster
python3 tools/build_site.py             # -> ~11 MB self-contained index.html
```

`encode_media.py` cross-fades each clip's tail back over its head before cutting
it, so `<video loop>` has no visible seam, then two-passes it to a per-section
size budget and pulls a JPEG poster.

Build with `--no-remote` for a page that makes no network requests at all, even
with clips missing.

### Atmosphere beds

Every media section also carries a CSS-only animated bed — three slowly drifting
radial gradients keyed to that clip's palette — layered beneath the video. It is
the load-in state before the first frame decodes, and the whole treatment
anywhere the clip cannot play: offline, on a slow connection, or inside a sandbox
that blocks external media. Sections are never flat. Both the beds and the
scroll reveals stand down under `prefers-reduced-motion`.

## Behaviour

Vanilla JS, ~120 lines, no dependencies.

- Header solidifies once you leave the hero
- Full-screen mobile drawer — focus moves in and back out, Escape closes it
- Scroll reveals via `IntersectionObserver`, with a `<noscript>` guard so the
  page is never blank when scripting is off
- Off-screen clips load only when they are ~300px from the viewport
- Per-section play/pause, which stays hidden unless the clip actually decoded —
  no dead controls
- Code tabs with arrow-key roving focus
- Newsletter field validates locally and says so; nothing is stored or sent

## Before this faces a public audience

Copy is written for the fictional product; the numbers are **illustrative and
must be replaced**:

1. **Platform figures** — "12 yrs of tick history", "40+ venues", "1.1 ms median
   ack", and every backtest figure in the code panel (Sharpe 1.84, -8.2% drawdown,
   $180M capacity). Substitute measured numbers or drop the strip.
2. **Capability claims** — colocation, venue coverage, borrow and corporate-action
   data, the audit trail. Each needs to be true before it ships.
3. **Fonts** — `the-future` and `tiempos` came from the reference capture the team
   supplied and are commercial faces. Confirm SquaredQ holds a webfont licence, or
   substitute before launch. Swapping them is two `@font-face` blocks in
   `src/index.template.html`.
4. **Links** — nav and footer are in-page anchors. Point them at real destinations.
5. **Newsletter** — wire the form to a real list; today it only validates.

The footer already carries a "nothing here is investment advice" line, which a
trading-software site needs regardless.
