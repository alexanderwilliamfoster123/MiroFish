# Bullo — 3D multi-page marketing site

A finished, multi-page marketing website with a real-time 3D hero on every page,
scroll-driven animation, scroll-reveal sections, sticky glass navigation, a mobile
menu, and working forms. Inspired by the reference designs (Bullo / EXITO), built
to a Revolut/Apple level of polish. Everything runs offline — Three.js is vendored.

## Pages (every nav link & button routes somewhere real)

| Page | File | 3D hero |
|---|---|---|
| Home | `index.html` | Rolling rose-gold coin |
| Trade | `trade.html` | Rose-gold glass ring |
| Technology | `technology.html` | Violet glass coins (dark theme) |
| Pricing | `pricing.html` | Ring + ribbed metal bead |
| Company | `company.html` | Rolling coin (+ `#careers`, `#press`) |
| Open account | `get-started.html` | Signup form with success state |
| Log in | `login.html` | Login form (routes to Trade) |

## Run it

Static site — serve over `http://` (ES modules + import map need a server):

```bash
cd bullo-site
python3 -m http.server 8077
# open http://localhost:8077/
```

## Structure

```
bullo-site/
├── index.html, trade.html, …      # pages (shared nav + footer markup)
├── favicon.svg
├── assets/
│   ├── site.css                   # design system: tokens, type, buttons, nav,
│   │                              #   cards, pricing, footer, scroll-reveal
│   ├── site.js                    # sticky nav, mobile menu, reveal observer
│   └── hero3d.js                  # one reusable 3D engine; picks the object from
│                                  #   <canvas data-scene="coin|ring|coins|bead">
└── vendor/three/                  # Three.js + RoomEnvironment (offline)
```

## How the 3D works

Each page has a fixed full-screen `<canvas data-scene="…">`. `hero3d.js` reads the
scene name, builds the matching object (metallic coin or transmissive glass), and
maps its rotation, position, and the camera to scroll progress (eased), plus subtle
mouse parallax. No video, no image sequences — all real-time geometry and lighting.

## Notes

- Forms are front-end only (demo): signup shows a success screen, login routes to
  the Trade page. Wire them to a backend to make them real.
- Respects `prefers-reduced-motion` (disables reveal animation).
- To swap the primitive objects for designed models, load a `.glb` via `GLTFLoader`
  inside a `hero3d.js` builder and keep the same `update()` motion.
