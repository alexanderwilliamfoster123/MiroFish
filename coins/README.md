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
