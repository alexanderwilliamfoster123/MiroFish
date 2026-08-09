# tape-shelf

The VHS cassette library from the personal site, extracted as a
self-contained, embeddable component: a continuous shelf of procedural 90s
cassettes (beveled clearcoat shells, aged stickers with stripe accents,
spool windows with per-tape wind ratios) with drag / wheel / arrow-key
browsing and a click-to-inspect view with orbit, pan, and zoom.

## Files

- `tape-shelf.js` — the component (ES module; tape factory + scene +
  interactions + UI chrome, all created inside your container)
- `tape-shelf.css` — styles, fully scoped under `.ts`
- `index.html` — runnable full-page demo (19 placeholder tapes)
- `vendor/three.module.min.js` — pinned three r165 (the only dependency)
- `fonts/inter-latin-400-normal.woff2` — Inter 400 for the demo

## Quick start

```bash
python3 -m http.server 8080   # in this folder
# open http://localhost:8080
```

## Use in another project

```html
<link rel="stylesheet" href="tape-shelf.css">
<div id="shelf" style="width: 100%; height: 100vh"></div>
<script type="importmap">{ "imports": { "three": "./vendor/three.module.min.js" } }</script>
<script type="module">
  import { mountTapeShelf } from "./tape-shelf.js";
  const app = mountTapeShelf(document.getElementById("shelf"), {
    tapes: [
      { title: "how i built my studio", url: "https://www.youtube.com/watch?v=..." },
      // one entry per cassette, left to right
    ],
    background: "#000000",   // any css color, or "transparent"
    theme: "dark",           // "dark" = light UI text, "light" = light shelf + dark UI text
    fontFamily: "Inter, sans-serif",
    linkLabel: "watch on youtube ↗"
  });
  // later: app.goTo(4); app.open(4); app.close(); app.destroy();
</script>
```

In a bundler project (Vite, Next, etc.) skip the import map, `npm i three`,
and import `tape-shelf.js` directly. In React, mount inside an effect:

```jsx
useEffect(() => {
  const app = mountTapeShelf(ref.current, { tapes });
  return () => app.destroy();
}, []);
```

## Notes

- The container needs an explicit height; a ResizeObserver tracks its size,
  so it works full-page or as a section.
- Sticker text is baked into canvas textures using `fontFamily` — load that
  font in your page (the demo self-hosts Inter 400) or pass your own.
- Titles, sticker aging, stripe accents, shelf jitter, and spool wind ratios
  are derived deterministically from each tape's position in the list.
- Keyboard controls (arrows, enter, esc) are scoped to the container.
