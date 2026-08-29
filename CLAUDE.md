# Paktos — Project Brief v2 (for Claude Code)

A skill-based **trading-competition** web app — "chess.com meets Call of Duty for trading." Users compete on **simulated** demo accounts (no real instruments, no market risk) in 1v1 Arena battles, house-backed AI battles, and a card-fan "Flick" trade-decision game, with a full social layer on top. The whole product is one self-contained prototype: a **single HTML file**.

> The simulated engine is the core regulatory positioning: it keeps the platform outside financial-services regulation while pursuing **skill-competition** classification jurisdiction by jurisdiction. Keep that framing intact (see "Product & regulatory context" at the bottom).

This is **v2** of the brief. v1 described the sibling build `tradr-app.html`; this version documents the current build, **`static/live-dashboard.html`**, and every system added since.

---

## 1. The build

- **Everything lives in `static/live-dashboard.html`** (~9,000 lines / ~520KB): a single-file vanilla-JS SPA. No build step, no framework, no npm — React/shadcn component references get **ported natively** (CSS + vanilla JS + SVG/canvas), never installed.
- **No backend.** All data is deterministic mock data generated in-page. Battle accounts, battles, streaks, profile and trade log **persist to localStorage** (`pkDB`, `pkStreak`); everything else resets on reload.
- Aesthetic: **neumorphic, Apple-clean, light-first** with a dark mode. Soft raised/inset shadows (`--neu-out`, `--neu-in`), rounded cards, tabular numbers.
- **Brand tokens** (implemented from `Paktos_Guidelines.pdf`, 2026): neutral scale `#FFFFFF / 050 #F2F1F3 / 200 #C9C9CF / 400 #94939F / 600 #61606C / 700 #494851 / 800 #303036 / 900 #18181B / #000000` — theme vars map onto it (light text `#18181b`/`#494851`/`#94939f`, dark bg `#18181b`). Plum `#6A2E9E` (light-bg accent) + Lavender `#D3C2F0` (dark-bg accent) via `--lbA`/`--lbBsoft`; `--accent-a #6A2E9E`, `--accent-b #D95DDF`; standout gradient `#F0DCFF → #FF8E94 → #D95DDF → #9081DF` (`--brandGrad`) used sparingly. Off-brand violets/blues are swept — don't reintroduce `#7c3aed`-family hexes. **Font**: Satoshi Variable (Fontshare link in head) with Google `Plus Jakarta Sans` fallback (the artifact CSP blocks Fontshare and falls back cleanly); wordmark + `.brand-name` in `Source Serif 4`. **Logo**: the real 4-chevron ascending mark (exact vectors extracted from the guidelines PDF) lives in `.brand-mark`, `.auth-logo` and `MARK_SVG` (viewBox `0 0 100 100`, 4 paths, `currentColor`). Verified-badge blue and content tints (avatars, instrument icons, award colors) are intentionally NOT brand-swept — they're semantic. **No red on losing amounts** — losses render neutral. **No emojis in UI chrome** except country flags, character-face avatars, and icon spots (never inline in text).

## 2. Architecture (inside the one `<script>`)

- **Views**: `#views > .view[data-view]` panels. `navigate(v)` sets the active view, calls the matching entry in the **`RENDER`** map, and updates the topbar from **`TITLES`**. Current views: `arena, live (spectator hub), spectate, terminal, ideas (Flick), social (Feed), performance, trader (profiles), challenge, partner (hidden), clan (gated)`.
- **Rendering is string-based**: render functions build template-literal HTML and assign `innerHTML`. Live updates go through a global ticker that patches individual elements by `data-*`/id.
- **Numbers**: the rolling-odometer animation is **retired**. `odoInner(str)` returns the plain string and `setOdo(target, str)` sets `textContent`. `.odo` is now just `tabular-nums` styling. Don't reintroduce digit strips — they garbled repeatedly.
- **Modals**: veil pattern — a `div.pk-veil` (or `.esc-veil` for tickets) appended to `<body>` with an id (`btVeil`, `escVeil`, `coVeil`, `bsVeil`, `psVeil`, `winVeil`, `invVeil`, `clanVeil`), content via `innerHTML`, removed on close. Most close on outside-click via an explicit `e.target.id === '<veil>'` check.
- **Theme**: CSS custom properties on `:root`, `body.dark` overrides. Custom toggle `#theme-state` (the checkbox is visually hidden — tests must dispatch `change`, not click it).
- **Nav**: bottom **dock** (`nav.dock > #dockList`) with spring magnification (`dockLoop`) — Arena / Trade / Ideas / Feed; profile avatar `#tbAv`, envelope (inbox) and bell (notifications) top-right.

### Event handling — **READ THIS BEFORE ADDING BUTTONS**
Two big delegated click listeners on `document`. Rules that have bitten us:
- **ORDER MATTERS**: specific handlers must sit **before** card-level fall-throughs; `[data-trader]` (open profile) is last. New handlers for elements inside cards go **above** the card's own handler.
- The **first** listener defers `[data-cnt]`/`[data-enter]` to the second via an early `if (q('[data-cnt]') || q('[data-enter]')) return;`.
- An early `[data-tst]` tooltip check **swallows clicks** on any element bearing that attribute — don't put `data-tst` on real buttons.
- `q` is `e.target.closest(...)` scoped per listener; return after handling.

## 3. Editing conventions (how we work — keep doing this)

- Edit via **Python heredoc scripts** with a helper `rep(old, new, label)` that **asserts presence and uniqueness** before replacing; whole-function rewrites slice by `src.index(startMarker):src.index(endMarker)`. A failed assert aborts **before** the write, leaving the file untouched.
- **Pre-check every anchor read-only first** when doing multi-edit passes. Anchors from **reverted commits do not exist** — this has caused aborted passes twice.
- **Validate every change**: extract the `<script>` and run `node --check`. Must pass before shipping.
- **Verify headless** with Playwright before every commit: chromium at `/opt/pw-browsers/chromium` against `http://localhost:8899/live-dashboard.html` (serve with `python3 -m http.server 8899` from `static/`). Use `waitUntil: 'domcontentloaded'` (`networkidle` hangs on avatar images). Note the shell **cwd resets between commands** — always `cd` explicitly.
- When slicing out a function, check nothing else lives **between** your markers (a win-share generator was once deleted this way and had to be recovered from the transcript).
- Scope new CSS classes (`mb-`, `bt-`, `wm-`, `frost-` …) — a global rule breaks everything after it.

## 4. What's built (feature inventory)

### The money loop — battles, end to end
- **Accept flow** (all three entry points route through it: challenge-card **Accept**, **Battle the machines**, feed **call-out accept**): `openTerms(cfg)` → "Take the other side" terms modal (You-vs-Opp, THE ARENA chip, window/kick-off/stakes rows, winner-takes after the **10% platform fee**, green if-you-win + neutral if-you-lose panels, odds footnote) → `openPay()` → **SECURE CHECKOUT** sheet (Card ••••4471 / Apple Pay / Bank transfer / **Paktos balance** with a real balance check + deduction; stake/fee/pay-now rows) → `commitBattleFlow()` → `startBattle(cfg)`. Challenges are only consumed after payment. Handlers: `data-accept / data-mbattle / data-fdaccept / data-btpay / data-btpm / data-btgo / data-btclose / data-btback`.
- **Battle engine**: `startBattle` provisions a fresh funded account `BTL-<seq>` (£10,000 `BATTLE_CAPITAL`) pushed to `ACCTS`, creates a `myBattles` entry, notifies, marks streak, saves, and shows the **escrow ticket**. `battleRet(b)` derives your battle return from the account's real closed trades. Settlement sweeps P&L to the main account, tears down the battle account, records to `pkLedger`, and fires reward/loss flows.
- **Escrow ticket** (`showEscrowTicket`): cut-out ticket with barcode (`barcodeSVG`), escrow id, locked-at, account chip, **frosted pot card**, Start-trading + Share + Done actions, confetti.
- **Frosted prize-pool card** (`frostPotHTML`, native FrostedCard port): icy SVG texture (feTurbulence + shards), 3D mouse tilt on `.frost-card`, shows the pot "FROZEN IN ESCROW" on the terms modal and escrow ticket.
- **Your battles**: compact `mb-card` grid (plum/lavender lead bar — no red/green tug), pot chip, live plain-number returns, account chip, Trade-it and Share buttons.
- **Terminal**: account **dropdown switcher** (`.acct-dd`, `data-acctdd`/`data-tacct`) across main + battle accounts; `data-btrade` jumps straight to a battle's account.

### Share cards (canvas 1080×1350, download + X-intent from a `pk-veil` modal)
All generators draw to canvas so they work under the artifact CSP (no external images).
- **Duel invite** (`drawCallout`/`showCallout`, fires after `data-invsend`): **clean light playing card** — white face on soft ground, quiet mirrored VS+pot corner inscriptions, matchup, then **stats only** (stake/odds/pot/kick-off/markets). X-intent **tags the opponent** `@handle`. No slogans — people caption it themselves.
- **Live battle** (`drawBattleShare`/`showBattleShare`, via `data-bshare` on battle cards + escrow ticket): same clean light system — matchup with live returns, pot-in-escrow row first, window/markets/account/watching.
- **Feed post story** (`drawPostShare`/`showPostShare`, via the share arrow `data-pshare` on any post): X-style glassy dark card with glow border, avatar/name/verified/handle, wrapped text, engagement stats.
- **Prize winnings** (`drawWinShare`/`showWinShare`, via `data-sharewin` on profiles): dark story card with equity line, club plaque, win rate/record/rank tiles.

### Arena & spectating
- **Arena**: hero with plain bold counters + App-Store button; Biggest-battles rail; **Battle the machines** (GPT-5/Claude/Gemini; house-backed stakes; **raised** stat tiles, not inset); open challenges with **Accept/Decline**; challenge detail view (`data-chopen`).
- **Live hub** (`live`): starts **straight on the filter bar + grid** (no hero). Grid/table toggle, pot/duration/sort filters, clean-linear measured-pixel charts (`lbChartInto` — no stretched viewBox text, no gradients, dashed grid). **Battles across the globe** dotted world map (`wmSVG`, native port: continent polygons → dot grid, animated escrow arcs via `pathLength`, pulsing city pins) sits **below** the grid, width-capped.
- **Spectate**: matchup hero, lead bar, equity chart with hover tooltip, cheer buttons, per-side cards (bio, live tape, loadout), ringside chat. All numbers plain text.

### Social & identity
- **Feed** (`social`): X-style posts (thought/media/battle-live/callout/result/idea), composer, like/repost/bookmark, call-out embeds with accept → terms flow, post **story share**.
- **Profiles** (`trader`): unified **Prize-winnings share card** with **club plaque** on it (`.shc-club` + `awardBadgeHTML`), Insights, Share ↗; expanding **socials card** (fan-out icons, `myProfile.socials` persisted); tabs **Overview / Spec / Activity** — Spec holds **flip badges** (front name / back earn-spec, ±15° tilt) and the **Paktos Clubs ladder** (`CLUBS`, `clubFor(winnings)` — bronze→gold+ tiers stamped from verified winnings, progress bar, locked plaques).
- **Streaks**: `pkStreak` in localStorage, marked on closed trades / battles / taken ideas; streak card on Performance.
- **Ideas (Flick)**: card-fan carousel (`FAN_POS`, arrows only, deck splices on take), spec details, take-trade → terminal.
- **Inbox**: Messages (working DMs) / Contacts / Invites. **Notifications** bell with curated events.
- **Sign-in**: optional (`authVeil` hidden by default, shown on sign-out; liquid conic-gradient CTA; "Continue without" link). **Never gate the app behind it.**
- **Invite modal** (`openInvite`): Invite-to-Paktos and Challenge-to-a-duel tabs (who/stake/odds/kick-off chips) → sends → duel share card.

### Gated / parked (code intact, UI off)
- `FEATURE_NATION_WARS = false`, `FEATURE_CLANS = false` — flip to relaunch.
- **Partner portal**: topbar Trader/Partner toggle is `[hidden]` — remove the attribute to bring it back. A fuller tabbed affiliate portal + entries checkout exists in reverted commit `e87097f` for cherry-picking.
- Settled-battles ledger table removed from UI (`9cff52e`); `pkLedger` data still records.

### Verification harness
Scratchpad Playwright scripts (`audit.mjs` = the 50-check forensic sweep incl. persistence, dark mode, 8-battle stress, rapid-nav; `flow.mjs`, `clean.mjs`, etc.). Run the audit after any substantial pass; all checks must be green with zero `pageerror`s.

## 5. Roadmap / open items

1. **Backend / persistence**: accounts, battles, escrow, DMs, feed need a server; localStorage is a stand-in.
2. **Real payments + escrow**: the SECURE CHECKOUT is a demo (labelled as such on-card); real money movement needs a PSP + client-money handling behind legal sign-off.
3. **Live prices / real AI opponents**: `INSTR` drift is simulated; machine opponents are scripted. Live data source candidate: WorldMonitor via REST/MCP — *consume the API, do NOT fork the repo* (AGPL-3.0).
4. **Unified always-on pools**: fold tournaments into join-anytime pooled pots ranked by return — the cleanest regulatory model. Keep 1v1-odds / house-backed mechanics separate.

## 6. Product & regulatory context (load-bearing — don't undermine)

- **Simulated engine = the moat.** Real-money risk never sits on a market position; that's what keeps the skill-competition classification alive. FTMO is the primary precedent (skill, not gambling), but it's per-jurisdiction, not a universal shield.
- **Pooled rake is the safe model**: many entrants, ranked by skill, house takes a cut, winners paid from entries → house takes no position. This is the strongest posture.
- **Riskier mechanics** (gate behind legal sign-off per jurisdiction): 1v1 with player-set **odds** (≈ bookmaking), **house-backed** battles (house as counterparty ≈ dealer/gambling), escrow holding user money (client-money rules). "Battle the machines" is fine as a demo but is the hot spot for real money.
- Public-facing language: say **"commission"** (the UI says "10% platform fee") not "rake"; frame as skill competition, never "unregulated."
- Legal counsel (**Darin**) gates real-money mechanics. Nothing here is legal advice.

## 7. Getting started in Claude Code

- The app is `static/live-dashboard.html` — serve it (`cd static && python3 -m http.server 8899`) and open it; edit it directly.
- Work on branch `claude/live-dashboard-ui-buqqvm`; PR #1 tracks it — don't open new PRs.
- Before adding any clickable control, read §2 Event handling; put new handlers **above** card-level fall-throughs.
- After any edit: `node --check` the extracted script, then run the Playwright audit before committing.
- Match the brand tokens (§1); port pasted React components natively; keep losses neutral-coloured and numbers plain.
