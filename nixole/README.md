# Nixole — landing page

One-page TanStack Start landing page for **Nixole**, *AI that converts patients for medical practices*.

Stack: TanStack Start (file-based routing) · React 19 · Vite 7 · Tailwind v4 (CSS-first, no `tailwind.config.js`) · framer-motion · Inter Tight.

## Run

```bash
bun install
bun run dev      # http://localhost:3000
bun run build
bun run start    # serves .output/server/index.mjs
```

## Layout

```
src/
  styles.css            Tailwind v4 @theme tokens + mesh/marquee/dot-pop keyframes
  router.tsx            getRouter() — the entry TanStack Start resolves
  routes/
    __root.tsx          head() (title, description, Inter Tight <link>), RootShell, QueryClientProvider
    index.tsx           the whole page + AnimatedWords / AnimatedDottedFrame / inline brand SVGs
  assets/               the nine image/video assets, referenced via import URL
tools/
  download-assets.sh            fetches the real assets from qclay.design
  generate-placeholder-assets.py  renders the local stand-ins currently in src/assets
```

## Assets — read this before reviewing pixels

The nine production assets live under `https://qclay.design/lovable/nixole/`. **That host is
blocked by this environment's network egress policy** (`403` on CONNECT from the agent proxy,
for both `curl` and the fetch tool), so they could not be downloaded here.

`src/assets/` therefore currently holds **local stand-ins** rendered by
`tools/generate-placeholder-assets.py`, drawn at the exact dimensions the layout expects so
that every position, animation and reveal in the page is correct. To swap in the real files:

```bash
./tools/download-assets.sh    # from a network that can reach qclay.design
```

No code changes are needed — the imports and filenames already match.

Two knock-on notes:

- **`browser-mockup.png` is 330 × 303.** That height is not arbitrary: the dashed connector is
  pinned at `top: 43.25px` inside the mockup and has to terminate on the Key Features divider
  dot, which (with the popover at `bottom: -24px`, height `222px`) forces a ~303px mockup. If
  the real asset has a different aspect ratio, the connector will need its offsets retuned.
- **The four inline brand wordmarks** (`IntelLogo`, `OracleLogo`, `GoFundMeLogo`,
  `NutanixLogo` in `src/routes/index.tsx`) are vector stand-ins at the specified viewBoxes.
  The upstream path data was not included in the spec and is not reproducible from memory —
  replace the `<text>` node in each component with the real `<path>` entries.

## Verified in a headless browser

Title, meta description and the Inter Tight `<link>`; header logo pop + per-letter wordmark
rise; nav stagger; eyebrow pill; per-word headline rise across three visual lines; both CTAs;
the mesh card reveal with the mesh animating continuously; 68 connector dots popping in
sequence to draw the L from the browser seam dot to the Key Features dot; the highlighted
`Payments & Subscriptions` row; 4.5 yellow stars; a marquee whose track is exactly 2× one
group (1338 / 669), so `translateX(-50%)` lands on an exact repeat and the loop is seamless;
no horizontal overflow at 390px.

The nurse video was verified playing, circular and mid-aligned at 108 × 108, by temporarily
re-pointing the element at a VP9 transcode — the sandbox's Chromium build is the open-source
one and reports `canPlayType('video/mp4; codecs="avc1.42E01E") === ''`, so it cannot decode
H.264. Shipping browsers can; the element itself is unchanged and points at the `.mp4`.
