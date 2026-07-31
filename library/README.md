# library

A personal 3D library: a continuous shelf of 19 VHS cassettes rendered
in Three.js, where each volume links to a YouTube video. Plain HTML and ES
modules — no build step.

## Run

Serve the folder with any static file server and open `index.html`:

```bash
cd library
python3 -m http.server 8080
# http://localhost:8080
```

(Opening the file directly with `file://` will not work because the page uses
ES module imports.)

## Link your videos

Edit `js/books.js`. Each entry is one tape on the shelf, left to right:

```js
{ title: "how i built my studio", youtubeUrl: "https://www.youtube.com/watch?v=..." }
```

The title appears on the spine sticker and in the inspection caption; the URL
opens from "watch on youtube" while inspecting. Sticker stripe accents and
shell tone drift are derived deterministically from each entry's position.

## Controls

- browse: drag, mouse wheel / trackpad, arrow keys, the arrow buttons, or the
  position ticks
- inspect: click a tape (or press enter on the focused one) — then drag to
  orbit, scroll or pinch to zoom, shift-drag / right-drag / two-finger drag to
  pan, esc or the close button to return
- while inspecting, arrow keys or the ticks jump straight to another volume

## Notes

- `vendor/three.module.min.js` is a pinned copy of three r165; `fonts/`
  self-hosts Inter 400 (the only weight used anywhere).
- The cassettes are procedural stand-ins generated in `js/tapeFactory.js`. They
  were built locally because the Mint MCP asset pipeline was not reachable
  from the build session; a Mint-generated 19-piece asset pack can replace
  the factory later by loading manifest-synced GLBs and keeping the same
  returned record shape.
- Respects `prefers-reduced-motion`, and shows a plain-text notice if WebGL
  is unavailable.
