# Tradr

A faithful **React + Vite** port of the single-file `Tradr` prototype — a skill-based
trading-tournament app. Built as a self-contained project under `/tradr`, separate from
the MiroFish platform that shares this repository.

The port keeps the prototype's simulated data model as-is: prices, bots, prize pools and
leaderboards all tick live in the browser. No backend, no real money.

## Run

```bash
cd tradr
npm install
npm run dev      # dev server (Vite)
npm run build    # production build
npm run preview  # serve the production build
```

## Architecture

Idiomatic React shell + store, with the prototype's dense presentational markup reused
verbatim for pixel fidelity.

```
src/
  styles.css            # design system, copied verbatim from the prototype
  main.jsx, App.jsx     # entry + shell (rail nav, top bar, view routing, modals)
  store.jsx             # mutable sim state `S`, the live tick loop, and all actions
  components/           # Rail, TopBar, NotifPanel, Toast, BuyModal, RulesModal,
                        # Html (raw-SVG helper), DataScope (data-attr click bridge)
  engine/               # the ported logic layer
    data.js             # static datasets + constants (+ _bigdata/_affil/_feeddata/_world)
    format.js           # number/string formatting helpers
    icons.js            # inline-SVG string builders
    sim.js              # price/bot ticking, account maths, leaderboard, tournaments
    builders*.js        # verbatim row/card chunk builders (rendered via <Html>)
    perf.js             # performance dashboard cards + equity canvas chart
    terminal.js         # one-tap trade engine + candlestick canvas chart
    affiliate.js        # partner portal markup + earnings canvas chart
    feed.js, invites.js # social feed + invites subsystems
  views/                # one React component per screen
```

**How it fits together:** the shell, routing, store and modals are ordinary React.
Each view is a real React component; where the prototype builds large repetitive markup
as HTML strings, those exact builder functions are reused and rendered through a small
`<Html>` helper, with prototype-style `data-*` interactions bridged to the store via
`<DataScope>`. Canvas charts (equity, candlesticks, earnings) run in `useEffect` and
redraw on every simulation tick.

## What's live

Fully ported, driven by the running simulation:

- **Tournaments** — hero, active-tournament cards, past-events carousel, Hall of Fame hub, live countdowns
- **Leaderboard** — tournament switcher, live prize pool, podium + prize breakdown, paginated player field
- **Trade terminal** — live candlestick chart (timeframes, MA overlays), asset switching, one-tap Buy/Sell with style/risk/R:R, live position with breakeven/close, positions & history that auto-settle at TP/SL
- **Performance** — account selector, Overview/Return/Risk/Trades tabs, ranges, live equity/balance chart, period & risk breakdowns
- **Feed** — filters, composer, posts, battle/result embeds, media chart embeds, like/repost
- **Invites** — arena & competition invites, received/sent, accept/decline/cancel
- **Partner portal** — hero, KPI grid, earnings chart, milestones, funnel, world heatmap, network/clients/earnings/assets tabs
- Buy-entry flow, tournament rules, notifications, toast, light/dark theme, Trader/Partner mode

## Deferred

A few of the prototype's deepest secondary screens render a placeholder in this first
port (reachable via deep links, not the primary nav): the full **Arena** PvP battle
flow + spectating, individual **trader/account profiles**, the standalone **Hall of
Fame** page, the **Trade Ideas** board / swipe deck, and the **AI assistant** chat.
The core product surface above is complete.
