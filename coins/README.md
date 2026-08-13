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

## Prize vault (`jar.html`)

Tiny holographic chrome coins (the six deep spectrum palettes from the
coins page) drop into an armored-glass vault — brushed-steel plinth and
rim, gold trim, and a gold vault wheel that idles slowly and spins up on
wins. Glass so the pool stays visible (that's the product); vault frame
so it reads like millions, not a tip jar. The pile height tracks
sold / total proportionally, so it scales from a hundred tickets to
hundreds of thousands.

Every ticket is a celebration: a shower of cosmetic holo coins, spark
bursts, a glow pulse, a camera kick, a gold screen flash, and a "+$25"
floater. Rapid sales streak up (tier 1→3, "on fire ×N" pill) and the
whole thing escalates — cosmetic coins vanish after landing, so the
frenzy never corrupts the sold/total pile. `prefers-reduced-motion`
turns the fireworks off.

`mountJar(canvas, ui, opts)` sizes itself to the canvas's parent
(ResizeObserver), so the same component runs full-page or inside a
dashboard card; `ui.onCelebrate(tier, streak)` lets the host page flash
its own chrome. Feed it the live count any of three ways:

- URL params: `jar.html?sold=140&total=500`
- From script: `window.jar.setTickets(sold, total)` — e.g. poll your
  ticketing API every 30s and call this; new sales rain in as coins.
- `window.jar.buy(n)` increments locally (the demo button uses this).

The vault's visual capacity is ~300 coins; the pile maps proportionally,
so any ticket total works. Logic lives in `jar.js`
(`opts.camZ` sets camera distance: ~13 full-page, default for cards).

## Tournament dashboard (`dashboard.html`)

The jar living inside the trade-tournament dashboard: a live leaderboard
card next to the prize-pool card (jar + rolling $ counter + tickets bar +
buy CTA), with the draw countdown in the header. A demo simulator fires
random sales every few seconds so the jar goes off on its own —
`?sim=0` starts it paused, and the card's code comments show where to
poll a real ticketing API instead (`window.jar.setTickets(sold, total)`).

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
