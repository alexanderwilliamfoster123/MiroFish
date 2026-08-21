# putting the site on your domain

the site is a static build — no server to run. hosting is vercel;
signups flow into buttondown. about ten minutes of one-time setup,
then every push deploys itself.

## 1. host it on vercel

1. go to [vercel.com](https://vercel.com) → **add new project** → import
   the `MiroFish` repo (vercel connects to github as the code source —
   the hosting itself is vercel's).
2. in the project setup screen:
   - **root directory**: `personal-site`
   - framework preset: vite (auto-detected; build `npm run build`,
     output `dist` — the defaults are right)
3. deploy. you'll get a `*.vercel.app` url immediately.

## 2. point your domain at it

1. vercel project → **settings → domains** → add your domain.
2. vercel shows you exactly what to set at your registrar — either
   change the nameservers to vercel's, or add the single A record +
   www CNAME it prints. both work; nameservers are less fiddly.
3. https is automatic.

## 3. catch the signups in buttondown

1. create a free account at [buttondown.com](https://buttondown.com)
   and note your **username**.
2. vercel project → **settings → environment variables** → add:
   - name: `VITE_BUTTONDOWN_USERNAME`
   - value: your buttondown username
3. redeploy (deployments → ⋯ → redeploy) so the build picks it up.

from then on, every visitor who signs in at the gate is subscribed to
your buttondown list (their name rides along as metadata), ready for
your letters. buttondown sends them a confirmation email by default —
you can switch that off in its settings if you'd rather collect
silently. without the variable set, the site simply keeps emails in the
visitor's browser like before — nothing breaks.

the wiring lives in `src/lib/subscribe.ts` and is fire-and-forget: a
slow or down buttondown never blocks the door.

## worth knowing before launch

- **guests** skip email capture entirely — that's by design.
- **contact mail** opens the visitor's gmail/mail app addressed to
  alex@vertus.ai — works as-is in production.
- placeholder content to swap: company names, social hrefs and handles
  in `src/components/world.tsx`, and the letters in `src/lib/letters.ts`.
- which branch vercel deploys: it uses the repo's production branch
  (main by default). merge `claude/liquid-metal-button-integration-kns1mx`
  into main when you're happy, or point vercel's production branch at it
  in settings → git.
