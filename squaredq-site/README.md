# SquaredQ — marketing site

A single-file, self-contained landing page. `index.html` (~2.2 MB) carries every
asset it needs — fonts, images, video poster frames, and the full stylesheet are
all inlined — so it makes **zero network requests** and can be dropped on any
static host.

## Deploy

Serve the directory, or the file on its own:

```bash
python3 -m http.server -d squaredq-site 8000   # local preview
```

Any static host works — S3 + CloudFront, Netlify, Vercel, GitHub Pages, Cloudflare
Pages, nginx. There is no build step and no runtime.

## Where it came from

The page was built by reskinning a saved capture of an existing financial-services
homepage that the team supplied as the design reference. `tools/rebrand.py` is the
transform that produced `index.html`, so the work is reproducible and auditable:
drop the source capture in as `src.html`, run `make_brand_assets.py` then
`rebrand.py`, and you get the same output.

What the transform does:

| | |
|---|---|
| **Identity** | New SquaredQ wordmark in all 7 placements (nav, 5 product eyebrows, footer), new `Q²` app mark as the favicon, new `SQ WEEKLY` newsletter logotype |
| **Palette** | Warm greys cooled toward the brand ink `#141318`; electric indigo `#3a2fd8` carries primary action; newsletter panel retinted to `#dedbf7` |
| **Geometry** | Pill buttons squared off to a 10px radius — the one literal nod to the name |
| **Copy** | Brand names swapped in visible text and accessibility attributes only, never in CSS class names |
| **Cleanup** | Browser-extension injections, a third-party chat widget, and tracking pixels removed; all 68 outbound links neutered to `#`; remote video sources dropped |
| **Responsive** | The capture froze the page at desktop width, hiding every mobile-only asset. Those subtrees were unpinned so the stylesheet's own breakpoints work again |

## Before this goes in front of a public audience

Three things are inherited from the reference layout and are **placeholders**, not
SquaredQ facts:

1. **Marketing claims.** "Canada's most rewarding chequing account", "the fastest
   growing financial company in Canada", "Trusted by over 4 million Canadians",
   "2% cash back", "$0 commissions". Replace with SquaredQ's own substantiated
   copy. The one footnote that cited named third-party research firms has already
   been replaced with a visible placeholder rather than re-attributed.
2. **Product imagery.** The phone screenshots and video poster frames are raster
   assets from the reference and still show the original app UI. They need
   SquaredQ renders.
3. **Fonts.** `the-future` and `tiempos` are commercial faces inlined in the
   capture. Confirm SquaredQ holds a webfont licence for them, or substitute.

Every link is currently `#`. Point them at real destinations before launch.

## Brand assets

`tools/brand/` holds the source SVGs:

- `squaredq-wordmark.svg` — primary wordmark, 4.44:1
- `squaredq-mark.svg` — `Q²` app mark, 1:1, used as the favicon
- `sq-weekly.svg` — newsletter logotype

All three are single-path, single-fill, and survive a `brightness(0) invert(1)`
filter intact — which is how the page renders the wordmark white on dark sections.

## Brand tokens

Everything the rebrand touches lives in one `<style id="squaredq-brand">` block at
the end of `index.html`. Tune the palette there; nothing else needs editing.

```css
--sq-ink:          #141318   /* text, wordmark */
--sq-accent:       #3a2fd8   /* primary action only */
--sq-accent-strong:#2a21b0   /* accent hover */
--sq-accent-tint:  #dedbf7   /* newsletter panel */
--sq-paper:        #f5f3ef   /* section ground */
```
