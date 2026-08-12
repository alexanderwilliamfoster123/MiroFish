# Paktos Landing

A minimal landing page: Paktos logo + tagline + email capture. After the visitor
leaves their email, an animated ticket confirmation card (with confetti) is shown.

## Stack

- Vite + React 18 + TypeScript
- Tailwind CSS 3 with `tailwindcss-animate` (needed for the `animate-in` /
  `fade-in-0` / `zoom-in-*` utilities used by the ticket card)
- shadcn project structure (`components.json`, `src/components/ui`, `src/lib/utils.ts`,
  CSS-variable theme tokens in `src/index.css`, `@/*` path alias)

Note: the main MiroFish frontend (`../frontend`) is Vue 3 + plain JavaScript, so the
React/TSX components could not be integrated there. This app is a standalone
shadcn-structured project. Additional shadcn components can be added with:

```bash
npx shadcn@latest add <component>
```

Components live in `src/components/ui` — the shadcn CLI default. Keeping this exact
path matters because the CLI and copy-pasted registry components resolve imports via
the `@/components/ui` alias declared in `components.json` and `tsconfig.json`.

## Run

```bash
npm install
npm run dev      # dev server
npm run build    # type-check + production build
```

## Components

- `src/components/ui/ticket-confirmation-card.tsx` — `AnimatedTicket` confirmation
  card with confetti, barcode, and ticket cut-out styling.
- `src/components/ui/award-badge.tsx` — Product Hunt `AwardBadge` with holographic
  cursor-tracking effect (self-contained SVG, no external deps).
- `src/components/paktos-logo.tsx` — Paktos mark + serif wordmark.
