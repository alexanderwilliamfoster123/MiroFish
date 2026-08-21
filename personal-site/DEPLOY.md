# putting the site on your domain

the site is a static build — no server needed. a github action
(`.github/workflows/deploy-site.yml`) builds it and publishes to github
pages on every push that touches `personal-site/`.

## one-time setup (about five minutes)

1. **turn on pages** — repo → settings → pages → under "build and
   deployment", set **source: github actions**.

2. **tell it your domain** — repo → settings → secrets and variables →
   actions → **variables** → new repository variable:
   - name: `CNAME`
   - value: your domain, e.g. `alexanderfoster.com`

3. **point the domain at github** — at your registrar, add:

   | type  | host | value               |
   |-------|------|---------------------|
   | A     | @    | 185.199.108.153     |
   | A     | @    | 185.199.109.153     |
   | A     | @    | 185.199.110.153     |
   | A     | @    | 185.199.111.153     |
   | CNAME | www  | `<user>.github.io.` |

4. **claim the domain in github** — repo → settings → pages → custom
   domain → enter the domain → save, and tick **enforce https** once the
   certificate is issued (github provisions it automatically, usually
   within the hour).

5. **push** (or run the workflow manually from the actions tab). done —
   every future push redeploys itself.

## alternative: vercel / netlify / cloudflare pages

connect the repo in their dashboard and set:
- root directory: `personal-site`
- build command: `npm run build`
- output directory: `dist`

then add the domain in their domain settings and follow their dns prompt.
nothing in the code needs to change — the build is host-agnostic.

## worth knowing

- **visitor emails live in the visitor's browser** (localStorage) — the
  login captures name and email for the session, but nothing is sent to a
  server yet. to actually collect signups you'll want a tiny endpoint
  (formspree, buttondown, a supabase table, or a one-file serverless
  function) — one `fetch` call in `submitLogin` wires it up.
- **contact mail** opens the visitor's gmail/mail app addressed to
  alex@vertus.ai — that works as-is in production.
- placeholder content to swap before launch: company names, social hrefs
  and handles in `src/components/world.tsx`, and the letters in
  `src/lib/letters.ts`.
