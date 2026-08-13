# Paktos Waitlist Landing

A single-page waitlist funnel for Paktos. Built with Vite, React 18, TypeScript, and Tailwind CSS (shadcn-style components).

## The flow

1. **Landing** — Paktos lockup, "The World Is Watching.", email → **Join**
2. **Name** — "Your name" → **Continue**
3. **Handle** — "@yourhandle" → **Claim** (input is sanitized to lowercase letters, numbers, underscores, max 20 chars)
4. **Receipt** — "You're In! / MEMBER #xxxxxx", +500 XP, and the details they entered (name, @handle, email) → "Add 500 XP to my Paktos Card"
5. **Card** — confetti, brushed-metal Founding Member card (name, @handle, serial, joined date), holographic badge, XP roll-up → "Share to my story"
6. **Share** — generates a 1080×1920 story PNG on a canvas, shown immediately with **Share to Story** (native share sheet where supported, `navigator.share` with files) and **Save to Photos** (download). "I shared to my story" doubles XP and moves straight to the finale.
7. **Finale** — white screen with the "PAKTOS LAUNCH" countdown, quote, and social links.

## Run it

```bash
npm install
npm run dev        # dev server
npm run build      # production build → dist/ (code-split, hashed assets)
```

There is also a single-file build used for previews — everything inlined into one JS bundle:

```bash
SINGLEFILE=1 npm run build
```

## Where things live

- `src/App.tsx` — the whole flow / stage machine. Start here.
- `src/components/paktos-card.tsx` — members card, share screen, and the canvas story-image generator (`generateStoryImage`).
- `src/components/ui/ticket-confirmation-card.tsx` — the receipt.
- `src/components/ui/animated-countdown.tsx` — the finale countdown.
- `src/assets/` — logo lockups (1x/2x/4x), icon marks, coin-loop videos (currently unused by any screen, kept for reuse).

## What needs wiring up before launch (all front-end only today)

Everything currently runs client-side with simulated data. The single integration point is `handleHandleSubmit` → `issueTicket()` in `src/App.tsx`:

1. **Signup API** — post `{ email, name, handle }` on the handle Claim submit.
2. **Member number** — `issueTicket()` fabricates one (marked with a comment). Replace with the backend-assigned sequential number.
3. **Handle uniqueness** — the client only sanitizes; the backend must enforce availability/uniqueness and reject dupes.
4. **Launch date** — `GIVEAWAY_DATE` in `src/App.tsx` (currently 2026-10-11). Set the real launch timestamp.
5. **Social links** — the finale links to `x.com/tradepaktos`, `instagram.com/tradepaktos`, `linkedin.com/company/tradepaktos`. Confirm handles.
6. **Share tracking** — "I shared to my story" is self-reported; the raffle entry (+500 XP) trusts the click. Track it server-side if the raffle needs verification.

No env vars, no server, no analytics are set up yet.
