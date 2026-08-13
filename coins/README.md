# coins

The user's original "shiny coins loop" Spline scene on its own page
(`index.html`) — the scene streams live from Spline's CDN with the vanilla
runtime vendored in `vendor/spline/`, page background white.

To put the logo ON these coins while keeping their exact colour and style,
the edit has to happen in the Spline editor (the scene is not editable from
outside): open the project at spline.design, drop the logo SVG onto the coin
faces (or set it as a decal/texture on the coin material), and hit Update —
this page streams the live scene URL, so it picks the change up
automatically with no code edits.

`native.html` is a Three.js recreation with the logo minted in relief —
kept as a fallback; its colours were guessed and can be matched to a
screenshot of the original if needed.

## Run

```bash
python3 -m http.server 8080   # in this folder
# open http://localhost:8080
```

## Ticket jar (`jar.html`)

Coins drop into a glass jar as competition tickets sell; the pile height
tracks sold / total. Feed it the live count any of three ways:

- URL params: `jar.html?sold=140&total=500`
- From script: `window.jar.setTickets(sold, total)` — e.g. poll your
  ticketing API every 30s and call this; new sales rain in as coins.
- `window.jar.buy(n)` increments locally (the demo button uses this).

The jar's visual capacity is ~105 coins; the pile maps proportionally, so
any ticket total works. Logic lives in `jar.js`.

## Prize pool (`prize.html`)

The supplied Spline coins scene loaded directly, full viewport, on white —
geometry, materials, reflections, lighting, camera, shadows, and animation
untouched (vendored runtime 1.12.98, matching @splinetool/viewer@1.12.98;
only the scene streams from Spline). The coins sit on top and are carried
around a slow clockwise circle (one calm lap every two minutes — position
only, so the coins' own materials and baked spin stay exactly as
authored). Below them: the rolling prize-pool counter (sold × $25, gold
#FFC35C family), then a countdown to the draw, the buy CTA, and social
links at the bottom.

Hooks:

- `?sold=139` or `window.pool.setSold(n)` — live ticket count (demo
  button calls `window.pool.buy()`)
- `?ends=2026-09-01T00:00:00Z` — real close time for the countdown
  (placeholder: 14 days from load)
- `?lap=90` — seconds per coin lap; `?orbit=0` turns the circle off
- `?scene=` — load any other .splinecode
- social links are placeholder `#` hrefs in the footer — drop the real
  profile URLs in

`prize-native.html` keeps the earlier procedural recreation (holographic
ticket + paktos-marked spectrum coins) as an alternative.
