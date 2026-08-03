# MiroFish Marketing Site

A dependency-free, single-page marketing site for MiroFish with a scroll-driven
WebGL experience: six procedural shader scenes (one per section), a noise-cut
flip transition between them, spectral chromatic aberration, pointer parallax,
and film grain — all implemented from scratch in raw WebGL2 for this project.

## Run it

The page uses no build step and no external assets. Serve the folder with any
static server:

```bash
cd website
python3 -m http.server 8080
# open http://localhost:8080
```

Opening `index.html` directly from disk also works, since everything is inline.

## Notes

- **Accessibility**: honors `prefers-reduced-motion` (native scroll, static
  backgrounds, hard cuts instead of the wipe). Sections are plain semantic
  HTML and remain fully readable without JavaScript or WebGL.
- **Fallback**: if WebGL2 is unavailable, per-section CSS gradients take over.
- **Scroll model**: native scrolling plus CSS `scroll-snap`; a damped progress
  value drives the shader transition and content parallax, so the scrollbar,
  keyboard, and touch all work normally.
