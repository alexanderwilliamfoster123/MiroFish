// Simulation engine, ported from the prototype. Operates on a mutable state object `S`
// (held by the store). Keeps prices, bots, accounts, leaderboard and tournament maths.
import { START, NOTIONAL, START_BAL, PCT, TCOUNTRY, TNAMES, TFN, THAND } from './data.js'

// ---- accounts ----
export function makeAccount(S, cadence, seed) {
  S._accSeq = (S._accSeq || 0) + 1
  return {
    id: 'TR-' + (1000 + S._accSeq), cadence, entry: 25, start: START,
    closed: seed || 0, positions: [], peak: Math.max(START, START + (seed || 0)), maxDD: 0,
    openedAt: Date.now(), status: 'active', trades: [], eqHist: [START], balHist: [START]
  }
}

export function seedAccount(S, a, target, n) {
  const trades = [], wr = 0.46 + Math.random() * 0.16, span = 30 * 86400000
  const SYMS = S.syms
  for (let i = 0; i < n; i++) {
    const win = Math.random() < wr, base = a.start * 0.008 * (0.4 + Math.random() * 1.6)
    const pnl = win ? base : -base * (0.7 + Math.random() * 0.6)
    trades.push({ pnl, instrument: SYMS[Math.floor(Math.random() * SYMS.length)], side: Math.random() < 0.5 ? 'long' : 'short', size: +(0.5 + Math.random() * 4).toFixed(1), t: Date.now() - Math.floor((n - i) * span / n) })
  }
  const sum = trades.reduce((s, t) => s + t.pnl, 0); if (trades.length) trades[trades.length - 1].pnl += (target - sum)
  let eq = a.start; const hist = [eq]; trades.forEach((t) => { eq += t.pnl; hist.push(eq) })
  a.trades = trades; a.eqHist = hist; a.balHist = hist.slice(); a.closed = target; a.openedAt = Date.now() - Math.floor((180 + Math.random() * 230) * 86400000)
  let pk = hist[0]; a.maxDD = 0; hist.forEach((v) => { if (v > pk) pk = v; const d = (pk - v) / pk * 100; if (d > a.maxDD) a.maxDD = d }); a.peak = pk
}

// ---- account maths ----
export function unrl(S, a) {
  let u = 0
  a.positions.forEach((p) => {
    const mk = S.instr[p.instrument].price, dir = p.side === 'long' ? 1 : -1
    p.pnl = p.size * NOTIONAL * ((mk - p.entry) / p.entry) * dir; u += p.pnl
  })
  return u
}
export const eqOf = (S, a) => a.start + a.closed + unrl(S, a)
export const retOf = (S, a) => (eqOf(S, a) - a.start) / a.start * 100
export function ddOf(S, a) { const e = eqOf(S, a); if (e > a.peak) a.peak = e; const d = (a.peak - e) / a.peak * 100; if (d > a.maxDD) a.maxDD = d; return a.maxDD }
export const active = (S) => S.accounts.find((a) => a.id === S.activeId)
export const metric = (ret, dd) => ret - 0.45 * dd
export function rankFor(S, a) { const m = metric(retOf(S, a), ddOf(S, a)); let r = 1; S.bots.forEach((b) => { if (metric(b.ret, b.dd) > m) r++ }); return r }
export const totEquity = (S) => S.accounts.reduce((s, a) => s + eqOf(S, a), 0)
export const totPnl = (S) => S.accounts.reduce((s, a) => s + (a.closed + unrl(S, a)), 0)
export const bestRank = (S) => Math.min.apply(null, S.accounts.map((a) => rankFor(S, a)))
export const prizeFor = (S, r) => (r >= 1 && r <= 10 ? S.pot * PCT[r - 1] / 100 : 0)
export const potentialPrize = (S) => S.accounts.reduce((s, a) => s + prizeFor(S, rankFor(S, a)), 0)
export const inMoney = (S) => S.accounts.filter((a) => rankFor(S, a) <= 10).length
export const totalPool = (S) => S.tourOrder.reduce((sum, k) => sum + (k === S.tourSel ? S.potShown : S.tours[k].shown), 0)

// ---- ticking ----
export function tickPrices(S) {
  S.syms.forEach((s) => {
    const i = S.instr[s]
    const drift = (Math.random() - 0.5) * 2 * i.vol
    i.price = Math.max(i.price * (1 + drift), i.price * 0.5)
    S.hist[s].push(i.price); if (S.hist[s].length > 90) S.hist[s].shift()
  })
}
export function tickBots(S) {
  S.bots.forEach((b) => {
    b.ret += (Math.random() - 0.48) * 1.4; b.dd += (Math.random() - 0.5) * 0.4
    if (b.dd < 2) b.dd = 2; if (b.dd > 26) b.dd = 26
    b.hist.push(b.ret); if (b.hist.length > 26) b.hist.shift()
  })
}

// ---- leaderboard ----
export function board(S) {
  const a = active(S)
  const me = { handle: 'jstone', country: 'GB', ret: retOf(S, a), dd: ddOf(S, a), you: true, hist: S.youHist }
  const arr = S.bots.map((b) => ({ handle: b.handle, country: b.country, ret: b.ret, dd: b.dd, hist: b.hist, _b: b }))
  arr.push(me)
  arr.sort((x, y) => metric(y.ret, y.dd) - metric(x.ret, x.dd))
  arr.forEach((r, i) => {
    const rank = i + 1, prev = r.you ? S.myPrevRank : r._b.prevRank
    r.rank = rank; r.mv = prev ? prev - rank : 0
    r.score = Math.max(1, Math.min(99, 70 + metric(r.ret, r.dd))).toFixed(1)
    r.prize = prizeFor(S, rank)
    if (r.you) S.myPrevRank = rank; else r._b.prevRank = rank
  })
  return arr
}

// ---- tournament field ----
export function genTourBots(seed, scale) {
  const out = []; let sd = (seed >>> 0)
  function rnd() { sd = (sd * 1103515245 + 12345) >>> 0; return sd / 4294967296 }
  for (let i = 0; i < 24; i++) {
    let ret
    if (i === 0) ret = (980 + rnd() * 120) * scale
    else if (i < 3) ret = (40 + rnd() * 14) * scale
    else { ret = (11.5 - (i - 3) * 0.45 + (rnd() * 1.4 - 0.7)) * scale; const fl = 0.4 * scale; if (ret < fl) ret = fl + rnd() * 0.5 * scale }
    let name
    if (scale === 1 && i < TNAMES.length) name = TNAMES[i]
    else { const fn = TFN[Math.floor(rnd() * TFN.length)]; name = rnd() < 0.4 ? fn + THAND[Math.floor(rnd() * THAND.length)] : fn }
    out.push({ name, val: START_BAL * (1 + ret / 100), country: TCOUNTRY[(i * 7 + seed) % TCOUNTRY.length] })
  }
  return out
}
export function tourField(S) {
  const t = S.tours[S.tourSel]; if (!t.bots) t.bots = genTourBots(t.seed, t.scale)
  const youRet = S.accounts.length ? Math.max.apply(null, S.accounts.map((a) => retOf(S, a))) : 0
  const arr = t.bots.map((b) => ({ name: b.name, val: b.val, country: b.country, you: false }))
  arr.push({ name: 'jstone', val: START_BAL * (1 + youRet / 100), country: 'GB', you: true })
  arr.sort((x, y) => y.val - x.val)
  arr.forEach((p, i) => { p.rank = i + 1 })
  return arr
}
export function tourSwitch(S, id) {
  if (id === S.tourSel || !S.tours[id]) return
  const o = S.tours[S.tourSel]
  o.pool = S.pot; o.shown = S.potShown; o.ppl = S.potPpl; o.year = S.potYear; o.mile = S.mile; o.closesAt = S.closesAt
  const n = S.tours[id]
  S.pot = n.pool; S.potShown = n.shown; S.potPpl = n.ppl; S.potYear = n.year; S.mile = n.mile; S.closesAt = n.closesAt
  S.tourSel = id; S.lbPage = 0
}

export function computeMile(pool) {
  return { u100: Math.floor(pool / 100), k1: Math.floor(pool / 1000), k10: Math.floor(pool / 10000), k100: Math.floor(pool / 100000) }
}

// One simulation frame: prices, bots, pot growth, idea drift, equity history.
export function tick(S) {
  tickPrices(S); tickBots(S)
  if (Math.random() < 0.3) S.liveTraders += Math.floor(Math.random() * 4)
  const nT = 1 + (Math.random() < 0.6 ? 1 : 0) + (Math.random() < 0.3 ? 1 : 0)
  const potAdd = nT * (34 + Math.random() * 150) * Math.min(3.4, Math.max(0.32, Math.sqrt(S.pot / 250000)))
  S.pot += potAdd; S.potYear += potAdd * 1.15; S.potPpl = Math.round(S.pot / 25); S.mile = computeMile(S.pot)
  S.potShown += (S.pot - S.potShown) * 0.12; S.potFlash = potAdd
  S.tourOrder.forEach((k) => { if (k !== S.tourSel) { const tt = S.tours[k]; tt.shown += (10 + Math.random() * 55) * Math.min(4, Math.max(0.4, Math.sqrt(tt.shown / 250000))) } })
  const _tb = S.tours[S.tourSel].bots
  if (_tb) _tb.forEach((b, i) => { b.val += b.val * 0.00010 * (0.4 + Math.random() * 1.3) * (i === 0 ? 1.3 : 1) })
  const ac = active(S)
  ac.eqHist.push(eqOf(S, ac)); if (ac.eqHist.length > 240) ac.eqHist.shift()
  ac.balHist.push(ac.start + ac.closed); if (ac.balHist.length > 240) ac.balHist.shift()
  S.youHist.push(retOf(S, ac)); if (S.youHist.length > 26) S.youHist.shift()
}
