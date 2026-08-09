# business-cards

The businesses page from the personal library site, extracted as a
self-contained, embeddable component: a row of floating 3D cards (dark
clearcoat body, holographic triangle emblem, per-business name/tagline/link)
with drag / wheel / arrow-key browsing and a click-to-inspect view with
orbit, pan, and zoom.

## Files

- `business-cards.js` — the component (ES module; card factory + scene +
  interactions + UI chrome, all created inside your container)
- `business-cards.css` — styles, fully scoped under `.bc`
- `index.html` — runnable full-page demo
- `vendor/three.module.min.js` — pinned three r165 (the only dependency)
- `fonts/inter-latin-400-normal.woff2` — Inter 400 for the demo

## Quick start

```bash
python3 -m http.server 8080   # in this folder
# open http://localhost:8080
```

## Use in another project

```html
<link rel="stylesheet" href="business-cards.css">
<div id="cards" style="width: 100%; height: 100vh"></div>
<script type="importmap">{ "imports": { "three": "./vendor/three.module.min.js" } }</script>
<script type="module">
  import { mountBusinessCards } from "./business-cards.js";
  const app = mountBusinessCards(document.getElementById("cards"), {
    businesses: [
      { name: "Vertus", tagline: "", url: "https://vertus.ai" },
      { name: "Vanquish", tagline: "", url: "https://example.com" },
      { name: "Alexander William", tagline: "", url: "https://example.com" }
    ],
    background: "#000000",   // any css color, or "transparent" to sit over your page
    theme: "dark",           // "dark" = light UI text, "light" = dark UI text
    fontFamily: "Inter, sans-serif",
    linkLabel: "visit ↗"
  });
  // later: app.goTo(1); app.open(2); app.close(); app.destroy();
</script>
```

In a bundler project (Vite, Next, etc.) skip the import map, `npm i three`,
and import `business-cards.js` directly — the bare `"three"` import resolves
from node_modules. In React, mount inside an effect:

```jsx
useEffect(() => {
  const app = mountBusinessCards(ref.current, { businesses });
  return () => app.destroy();
}, []);
```

## Notes

- The container needs an explicit height; the component tracks its size with
  a ResizeObserver, so it works full-page or as a section.
- Card text is baked into canvas textures using `fontFamily` — load that font
  in your page (the demo self-hosts Inter 400) or pass your project's font.
- `background: "transparent"` renders with an alpha canvas so the cards float
  over whatever is behind the container; the inspect veil still dims the
  scene behind the lifted card.
- Keyboard controls (arrows, enter, esc) are scoped to the container, which
  is made focusable; multiple mounts on one page work independently.
