// One-tap trade terminal engine, ported from the prototype. Simple mode: pick asset,
// style, risk and R:R, then Buy/Sell. Positions auto-settle at TP/SL as prices tick.
import { pxv, pct, gbp2, LT } from './format.js'
import { srcTag } from './perf.js'

export const TMODES = { scalp: { d: 0.0005, pips: '5 pips', sub: 'seconds', lbl: 'Scalp' }, day: { d: 0.0010, pips: '10 pips', sub: 'minutes', lbl: 'Day' }, swing: { d: 0.0050, pips: '50 pips', sub: 'hours', lbl: 'Swing' } }
export const TASSETS = ['XAU/USD', 'BTC/USD', 'EUR/USD', 'US100']
const TF_BARS = { '1m': 36, '5m': 60, '15m': 92, '1H': 132, '1D': 160 }
const TF_MS = { '1m': 60000, '5m': 300000, '15m': 900000, '1H': 3600000, '1D': 86400000 }

export const px = (S, s) => pxv(S.instr[s].price)
export const termRiskAmt = (S) => S.term.bal * S.term.risk / 100
export const termRewardAmt = (S) => termRiskAmt(S) * S.term.rr
export function termLevels(S, dir) {
  const s = S.term.asset, e = S.instr[s].price, d = e * (TMODES[S.term.mode] || TMODES.day).d
  return { entry: e, d, sl: dir === 'up' ? e - d : e + d, tp: dir === 'up' ? e + d * S.term.rr : e - d * S.term.rr }
}

export function termPlace(S, dir, src, toast) {
  const L = termLevels(S, dir)
  if (S.positions.filter((q) => q.acct === S.term.acct).length >= 6) { toast && toast('Max 6 open positions on this account'); return }
  S.posSeq = (S.posSeq || 0) + 1
  const pos = { id: 'P' + Date.now().toString(36) + S.posSeq, acct: S.term.acct, sym: S.term.asset, dir, entry: L.entry, sl: L.sl, tp: L.tp, risk: termRiskAmt(S), rr: S.term.rr, style: S.term.mode, src: src || { t: 'manual', label: 'Terminal' }, openedAt: Date.now(), winEnd: L.tp, lossEnd: L.sl, r0: Math.abs(L.entry - L.sl) }
  S.positions.push(pos); S.term.pos = pos
}
function recordSettle(S, pos, d, toast) {
  const i = S.positions.indexOf(pos); if (i < 0) return; S.positions.splice(i, 1)
  S.term.bal += d; const res = d > 0.005 ? 'win' : (d < -0.005 ? 'loss' : 'be')
  S.term.streak = res === 'win' ? S.term.streak + 1 : (res === 'loss' ? 0 : S.term.streak)
  S.term.hist.unshift({ win: res === 'win', res, amt: d }); if (S.term.hist.length > 8) S.term.hist.pop()
  S.history.unshift({ sym: pos.sym, dir: pos.dir, result: res, amt: d, risk: pos.risk, rr: pos.rr, style: pos.style, src: pos.src, acct: pos.acct, closedAt: Date.now(), be: !!pos.be }); if (S.history.length > 60) S.history.pop()
  if (S.term.pos === pos) { const nx = S.positions.filter((q) => q.acct === S.term.acct); S.term.pos = nx.length ? nx[nx.length - 1] : null }
  toast && toast((res === 'win' ? 'Win +' : res === 'be' ? 'Breakeven · ' : 'Closed -') + gbp2(Math.abs(d)))
}
export function settlePos(S, pos, win, toast) {
  if (S.positions.indexOf(pos) < 0) return; let d
  if (win) { d = pos.risk * pos.rr } else { const r0 = pos.r0 || Math.abs(pos.entry - pos.sl) || 1; d = (pos.dir === 'up' ? (pos.sl - pos.entry) : (pos.entry - pos.sl)) * (pos.risk / r0) }
  recordSettle(S, pos, d, toast)
}
export function closePos(S, pos, toast) {
  if (!pos || S.positions.indexOf(pos) < 0) return
  const price = S.instr[pos.sym].price, r0 = pos.r0 || Math.abs(pos.entry - pos.sl) || 1
  const d = (pos.dir === 'up' ? (price - pos.entry) : (pos.entry - price)) * (pos.risk / r0); recordSettle(S, pos, d, toast)
}
export function moveBreakeven(S, pos, toast) {
  if (!pos) return; const price = S.instr[pos.sym].price, inProfit = pos.dir === 'up' ? price > pos.entry : price < pos.entry
  if (!inProfit) { toast && toast('Move to breakeven once the trade is in profit'); return }
  pos.sl = pos.entry; pos.lossEnd = pos.entry; pos.be = true; toast && toast('Stop moved to breakeven · risk-free now')
}
export function findPos(S, id) { return S.positions.find((p) => p.id === id) }

// ---- candles ----
function seedCandles(S, asset) {
  const base = S.instr[asset].price, step = base * S.instr[asset].vol * 7, arr = []; let p = base * (0.96 + Math.random() * 0.02)
  for (let i = 0; i < 120; i++) { const o = p, c = o + (Math.random() - 0.46) * step, h = Math.max(o, c) + Math.random() * step * 0.5, l = Math.min(o, c) - Math.random() * step * 0.5; arr.push({ o, h, l, c }); p = c }
  const lb = arr[arr.length - 1]; lb.c = base; if (base > lb.h) lb.h = base; if (base < lb.l) lb.l = base; return arr
}
export function termCandles(S, a) { a = a || S.term.asset; if (!S.term.candles[a]) S.term.candles[a] = seedCandles(S, a); return S.term.candles[a] }
export function updateTermCandle(S) {
  const a = S.term.asset, ca = termCandles(S, a), lb = ca[ca.length - 1], pr = S.instr[a].price
  lb.c = pr; if (pr > lb.h) lb.h = pr; if (pr < lb.l) lb.l = pr
  S.term._bt = (S.term._bt || 0) + 1; if (S.term._bt >= 4) { S.term._bt = 0; ca.push({ o: pr, h: pr, l: pr, c: pr }); if (ca.length > 240) ca.shift() }
}
const termBarLabel = (S, fromEnd) => { const ms = TF_MS[S.term.tf] || 300000, d = new Date(Date.now() - fromEnd * ms); return S.term.tf === '1D' ? ((d.getMonth() + 1) + '/' + d.getDate()) : (String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')) }
function rrect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath() }

export function drawTermChart(S, c, root) {
  if (!c) return; const dpr = window.devicePixelRatio || 1
  const w = c.clientWidth, h = c.clientHeight || 360; if (!w) return; c.width = w * dpr; c.height = h * dpr
  const ctx = c.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h)
  const ca = termCandles(S, S.term.asset), n = TF_BARS[S.term.tf] || 60, vis = ca.slice(-n); if (vis.length < 2) return
  let lo = Infinity, hi = -Infinity; vis.forEach((b) => { if (b.l < lo) lo = b.l; if (b.h > hi) hi = b.h }); const pd = (hi - lo) * 0.08 || 1; lo -= pd; hi += pd; const rng = (hi - lo) || 1
  const padR = 58, padB = 22, padT = 10, gw = w - padR, gh = h - padB - padT
  const Y = (p) => padT + gh - ((p - lo) / rng) * gh
  const up = LT() ? '#16a878' : '#7fb39a', down = LT() ? '#e5484d' : '#c98a8a', gl = LT() ? '#eceef1' : '#16171a', axt = LT() ? '#9498a1' : '#5e5e64'
  ctx.font = '9px JetBrains Mono'; ctx.textBaseline = 'middle'
  for (let g = 0; g <= 4; g++) { const yy = padT + gh * g / 4, val = hi - rng * g / 4; ctx.strokeStyle = gl; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(gw, yy); ctx.stroke(); ctx.fillStyle = axt; ctx.textAlign = 'left'; ctx.fillText(pxv(val), gw + 7, yy) }
  const bw = gw / vis.length, cw = Math.max(1.5, Math.min(9, bw * 0.6))
  vis.forEach((b, i) => { const cx = i * bw + bw / 2, col = b.c >= b.o ? up : down; ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx, Y(b.h)); ctx.lineTo(cx, Y(b.l)); ctx.stroke(); const yo = Y(b.o), yc = Y(b.c), tp = Math.min(yo, yc), bh = Math.max(1, Math.abs(yc - yo)); ctx.fillStyle = col; ctx.fillRect(cx - cw / 2, tp, cw, bh) })
  const IND = S.term.inds || {}
  const sma = (p, i) => { if (i < p - 1) return null; let sm = 0; for (let k = i - p + 1; k <= i; k++) sm += vis[k].c; return sm / p }
  const plotLine = (fn, col, wd) => { ctx.strokeStyle = col; ctx.lineWidth = wd || 1.6; ctx.lineJoin = 'round'; ctx.beginPath(); let started = false; vis.forEach((b, i) => { const v = fn(i); if (v == null) return; const x = i * bw + bw / 2, y = Y(v); if (!started) { ctx.moveTo(x, y); started = true } else ctx.lineTo(x, y) }); ctx.stroke() }
  if (IND.sma9) plotLine((i) => sma(9, i), '#5b8bff', 1.7)
  if (IND.sma21) plotLine((i) => sma(21, i), '#f5a524', 1.7)
  const P = S.term.pos
  if (P && P.sym === S.term.asset) { [['ENTRY', P.entry, axt], ['TP', P.tp, up], ['SL', P.sl, down]].forEach((z) => { const yy = Y(z[1]); if (yy < padT - 1 || yy > padT + gh + 1) return; ctx.strokeStyle = z[2]; ctx.globalAlpha = 0.85; ctx.lineWidth = 1; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(gw, yy); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1; ctx.fillStyle = z[2]; ctx.font = '8px JetBrains Mono'; ctx.textAlign = 'left'; ctx.fillText(z[0], 4, yy - 4) }) }
  const lb = vis[vis.length - 1], ly = Y(lb.c), lcol = lb.c >= lb.o ? up : down
  ctx.strokeStyle = lcol; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(0, ly); ctx.lineTo(gw, ly); ctx.stroke(); ctx.setLineDash([])
  ctx.font = '10px JetBrains Mono'; const lab = pxv(lb.c), pw = Math.max(ctx.measureText(lab).width + 12, padR - 4); ctx.fillStyle = lcol; rrect(ctx, gw + 2, ly - 9, pw, 18, 4); ctx.fill(); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText(lab, gw + 2 + pw / 2, ly)
  ctx.fillStyle = axt; ctx.font = '9px JetBrains Mono'; ctx.textAlign = 'center'
  ;[0, 0.5, 1].forEach((fr) => { const x = Math.max(16, Math.min(gw - 16, fr * gw)), bi = Math.round(fr * (vis.length - 1)); ctx.fillText(termBarLabel(S, vis.length - 1 - bi), x, h - 7) })
  if (root) {
    const oh = root.querySelector('#tmcOHLC'); if (oh) oh.innerHTML = 'O <b>' + pxv(lb.o) + '</b>  H <b>' + pxv(lb.h) + '</b>  L <b>' + pxv(lb.l) + '</b>  C <b>' + pxv(lb.c) + '</b>'
    const chg = (S.instr[S.term.asset].price - S.instr[S.term.asset].open) / S.instr[S.term.asset].open * 100, lc = root.querySelector('#tmcLch'); if (lc) { lc.textContent = pct(chg); lc.className = 'tmc-lch ' + (chg >= 0 ? 'up' : 'down') }
  }
}

// Per-frame terminal update: advance candle + auto-settle positions at TP/SL.
export function terminalTick(S, toast) {
  updateTermCandle(S)
  S.positions.filter((q) => q.acct === S.term.acct).slice().forEach((q) => {
    const qp = S.instr[q.sym].price
    const htp = q.dir === 'up' ? qp >= q.tp : qp <= q.tp, hsl = q.dir === 'up' ? qp <= q.sl : qp >= q.sl
    if (htp) settlePos(S, q, true, toast); else if (hsl) settlePos(S, q, false, toast)
  })
}

export function termOpenTable(S) {
  const arr = S.positions.filter((p) => p.acct === S.term.acct)
  if (!arr.length) return '<div class="tmempty">No open positions on ' + S.term.acct + ' · place a trade above to open one.</div>'
  return '<table class="tmptab"><thead><tr><th>Market</th><th>Side</th><th>From</th><th class="r">Entry</th><th class="r">P&amp;L</th><th class="r"></th></tr></thead><tbody>' +
    arr.map((p) => { const price = S.instr[p.sym].price, prog = p.dir === 'up' ? (price - p.entry) / (p.entry - p.sl) : (p.entry - price) / (p.sl - p.entry), pnl = prog * p.risk; return '<tr' + (p === S.term.pos ? ' class="foc"' : '') + '><td class="mono">' + p.sym + '</td><td class="' + (p.dir === 'up' ? 'up' : 'down') + '">' + (p.dir === 'up' ? 'Buy' : 'Sell') + '</td><td>' + srcTag(p.src) + '</td><td class="r mono">' + pxv(p.entry) + '</td><td class="r mono ' + (pnl >= 0 ? 'up' : 'down') + '">' + (pnl >= 0 ? '+' : '-') + gbp2(Math.abs(pnl)) + '</td><td class="r">' + (p.be ? '<span class="tmpx-be">BE ✓</span>' : '<button class="tmpx-b" data-bepos="' + p.id + '">BE</button>') + '<button class="tmpx-b x" data-closepos="' + p.id + '">Close</button></td></tr>' }).join('') + '</tbody></table>'
}
export function termHistTable(S) {
  const arr = S.history.slice(0, 12)
  if (!arr.length) return '<div class="tmempty">No closed trades yet · settled trades show here, tagged by where they came from.</div>'
  return '<table class="tmhtab"><thead><tr><th>Market</th><th>Side</th><th>From</th><th class="r">Result</th><th class="r">P&amp;L</th></tr></thead><tbody>' +
    arr.map((h) => '<tr><td class="mono">' + h.sym + '</td><td class="' + (h.dir === 'up' ? 'up' : 'down') + '">' + (h.dir === 'up' ? 'Buy' : 'Sell') + '</td><td>' + srcTag(h.src) + '</td><td class="r ' + (h.result === 'win' ? 'up' : h.result === 'be' ? '' : 'down') + '">' + (h.result === 'win' ? 'Win' : h.result === 'be' ? 'BE' : 'Loss') + '</td><td class="r mono ' + (h.amt >= 0 ? 'up' : 'down') + '">' + (h.amt >= 0 ? '+' : '-') + gbp2(Math.abs(h.amt)) + '</td></tr>').join('') + '</tbody></table>'
}
