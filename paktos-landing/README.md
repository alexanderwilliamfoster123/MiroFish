# Paktos Landing

Waitlist landing page for Paktos. The flow: 3D coin hero → email → name →
"You're In!" receipt with +500 XP → brushed-metal Paktos member card with a
silver holographic Founding Member badge → story-share screen (screenshot,
post, tag @tradepaktos for the $1,000 raffle) → +500 XP claimed after posting.

## Stack

- Vite + React 18 + TypeScript
- Tailwind CSS 3 with `tailwindcss-animate`
- shadcn project structure (`components.json`, `src/components/ui`,
  `src/lib/utils.ts`, CSS-variable theme tokens, `@/*` path alias)
- `@splinetool/react-spline` for the 3D coins hero (scene bundled locally,
  including its wasm dependency — no external requests at runtime)
- `@number-flow/react` for the XP roll-up animation

## Run

```bash
npm install
npm run dev            # dev server
npm run build          # production build (code-split, 3D loads lazily)
SINGLEFILE=1 npm run build   # fully self-contained single-chunk build
```

## Configuration

- `WAITLIST_LINK` in `src/components/paktos-card.tsx` — the link shown on the
  story-share screen.
- `XP_BONUS` in `src/App.tsx` — the Founding Member bonus size.
- Signups are client-side only; wire `handleNameSubmit` in `src/App.tsx` to
  your backend/CRM to actually store emails.

## Components (`src/components/ui`)

- `ticket-confirmation-card.tsx` — `AnimatedTicket` receipt with confetti,
  barcode, and optional XP / member-slot props.
- `award-badge.tsx` — holographic badge (gold/silver/bronze via `place`),
  extended with `topText` / `titleText` / `iconSrc` / `hideIcon` overrides.
- `tilt-card.tsx` — 3D cursor tilt with spotlight (used on the member card).
- `spline-hero.tsx` — lazy, CSP-safe Spline scene wrapper with an error
  boundary (the page never breaks if WebGL/wasm is unavailable).
- `liquid-glass-card.tsx`, `liquid-glass-button.tsx`, `payment-card.tsx`,
  `liquid-metal-button.tsx`, `number-flow-trading.tsx`, `input.tsx`,
  `label.tsx`, `button.tsx` — integrated library components, available but
  not all used by the current flow.

Brand assets (logo lockups at 1x/2x/4x, mark icons, Spline scene) live in
`src/assets/`, generated from the brand kit masters.
