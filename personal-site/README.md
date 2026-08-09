# personal-site

A minimal personal website. An email must be given at the door before the world behind it opens.

## Stack

- Vite + React 18 + TypeScript
- Tailwind CSS v4 (`@tailwindcss/vite`, tokens defined in `src/index.css`)
- shadcn project structure: UI primitives live in `src/components/ui`, shared helpers in `src/lib` (`cn()` in `src/lib/utils.ts`), with the `@/` path alias configured in `tsconfig` and `vite.config.ts`. `components.json` is set up so `npx shadcn@latest add <component>` drops new components into `src/components/ui` automatically.

## Flow

1. **Gate** (`components/email-gate.tsx`) — centered email capture with the `LiquidMetalButton` (`components/ui/liquid-metal-button.tsx`, WebGL shader from `@paper-design/shaders`).
2. **Receipt** (`components/subscription-receipt.tsx`) — on subscribing, an `AnimatedTicket` (`components/ui/ticket-confirmation-card.tsx`) is issued with confetti.
3. **World** — the landing page types out a welcome script in a `CodeBlock` (`components/ui/code-block.tsx`), and a macOS-style `Dock` (`components/ui/dock.tsx`) lives at the bottom of every page:
   - **Companies** — cards for each company
   - **Letters** — writing and thoughts
   - **Pictures** — album explorer built on `components/ui/scroll-morph-hero.tsx`
   - **Movies** — video cards

The visitor's email is kept in `localStorage` (`gate:email`); "leave" in the home footer clears it and closes the door again.

## Develop

```bash
npm install
npm run dev      # dev server
npm run build    # type-check + production build
```
