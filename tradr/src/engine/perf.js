// Performance dashboard helpers, ported from the prototype.
import { fmt, money, pct, gbp2, pxv, tago, LT } from './format.js'
import { eqOf, unrl } from './sim.js'

export const perfSet = (S) => S.perfAcc === 'all' ? S.accounts : S.accounts.filter((a) => a.id === S.perfAcc)
export const perfStart = (set) => set.reduce((s, a) => s + a.start, 0)
export const perfNet = (S, set) => set.reduce((s, a) => s + (a.closed + unrl(S, a)), 0)
export function perfTradesAll(set) { let t = []; set.forEach((a) => { t = t.concat(a.trades) }); return t }
export const perfDD = (set) => set.length ? Math.max.apply(null, set.map((a) => a.maxDD)) : 0
export const perfEquity = (S, set) => set.reduce((s, a) => s + eqOf(S, a), 0)
export const perfBalance = (set) => set.reduce((s, a) => s + a.start + a.closed, 0)

export function perfSeries(set) {
  const hs = set.map((a) => (a.eqHist && a.eqHist.length) ? a.eqHist : [a.start])
  const minL = Math.min.apply(null, hs.map((h) => h.length))
  const base = perfStart(set); if (minL < 2) return [base, base]
  const out = []; for (let i = 0; i < minL; i++) { let s = 0; hs.forEach((h) => { s += h[h.length - minL + i] }); out.push(s) } return out
}
export function perfBalSeries(set) {
  const hs = set.map((a) => (a.balHist && a.balHist.length) ? a.balHist : [a.start])
  const minL = Math.min.apply(null, hs.map((h) => h.length))
  const base = perfStart(set); if (minL < 2) return [base, base]
  const out = []; for (let i = 0; i < minL; i++) { let s = 0; hs.forEach((h) => { s += h[h.length - minL + i] }); out.push(s) } return out
}
export function rangeSlice(S, arr) {
  const f = ({ '1d': 0.1, '1w': 0.28, '1m': 0.7, '6m': 1, ytd: 1, '1y': 1, max: 1 })[S.perfRange] || 1
  const n = Math.max(2, Math.round(arr.length * f)); return arr.slice(arr.length - n)
}

export const srcTag = (src) => { const idea = src && src.t === 'idea'; return '<span class="srctag ' + (idea ? 'idea' : 'man') + '"><span class="sd"></span>' + (idea ? ('Idea' + (src.label ? ' · ' + src.label : '')) : 'Terminal') + '</span>' }
export const liveClosed = (S, set) => { const ids = set.map((a) => a.id); return S.history.filter((h) => ids.indexOf(h.acct) >= 0) }
export const liveOpen = (S, set) => { const ids = set.map((a) => a.id); return S.positions.filter((p) => ids.indexOf(p.acct) >= 0) }

// ---- card builders ----
export function chartCardHTML(S) {
  return '<div class="dh-card dh-chartcard"><div class="cc-head"><div class="cc-t">Account performance</div>' +
    '<div class="unit">' + ['usd', 'pct', 'log'].map((u) => { const lbl = u === 'usd' ? '£' : u === 'pct' ? '%' : 'log'; return '<button class="ub' + (S.perfUnit === u ? ' on' : '') + '" data-perf-unit="' + u + '">' + lbl + '</button>' }).join('') + '</div></div>' +
    '<canvas id="perfChart"></canvas><div class="cc-leg"><span class="lg"><span class="sw" style="background:#10a878"></span>Equity</span><span class="lg"><span class="sw" style="background:#9aa6c2"></span>Balance</span></div></div>'
}
export function periodRows(S) {
  const W = [['Today', 86400000], ['This week', 604800000], ['This month', 2592000000], ['All time', null]]
  return W.map((w) => {
    const set = perfSet(S); let tr = []
    set.forEach((a) => { a.trades.forEach((t) => { if (w[1] === null || Date.now() - t.t <= w[1]) tr.push(t) }) })
    const profit = tr.reduce((s, t) => s + t.pnl, 0), start = perfStart(set), gain = start ? profit / start * 100 : 0
    const wins = tr.filter((t) => t.pnl > 0).length, n = tr.length, lots = tr.reduce((s, t) => s + t.size, 0)
    return '<tr><td>' + w[0] + '</td><td class="' + (gain >= 0 ? 'up' : 'down') + '">' + pct(gain) + '</td><td class="' + (profit >= 0 ? 'up' : 'down') + '">' + money(profit) + '</td><td>' + (n ? Math.round(wins / n * 100) : 0) + '%</td><td>' + n + '</td><td>' + lots.toFixed(1) + '</td></tr>'
  }).join('')
}
export function periodCardHTML(S) {
  return '<div class="dh-card"><div class="cc-head"><div class="cc-t">Period performance</div></div>' +
    '<table class="pf-ptab"><thead><tr><th>Period</th><th>Gain</th><th>Profit</th><th>Win %</th><th>Trades</th><th>Lots</th></tr></thead><tbody>' + periodRows(S) + '</tbody></table></div>'
}
function riskTile(l, v, c) { return '<div class="rt"><div class="rt-l">' + l + '</div><div class="rt-v ' + (c || '') + '">' + v + '</div></div>' }
export function riskCardHTML(dd, sharpe, avgW, avgL, wr, tr) {
  const best = tr.length ? Math.max.apply(null, tr.map((t) => t.pnl)) : 0, worst = tr.length ? Math.min.apply(null, tr.map((t) => t.pnl)) : 0
  return '<div class="dh-card"><div class="cc-head"><div class="cc-t">Risk breakdown</div></div><div class="risk-grid">' +
    riskTile('Max drawdown', pct(-dd), 'down') + riskTile('Sharpe ratio', sharpe.toFixed(2), 'up') + riskTile('Win rate', wr.toFixed(1) + '%', 'up') +
    riskTile('Avg R:R', (avgL ? (avgW / avgL).toFixed(2) : '0.00') + 'R', '') + riskTile('Best trade', money(best), 'up') + riskTile('Worst trade', money(worst), 'down') +
    '</div><canvas id="perfChart" style="height:210px"></canvas></div>'
}
export function liveStripHTML(S, set) {
  const closed = liveClosed(S, set), open = liveOpen(S, set)
  if (!closed.length && !open.length) return '<div class="dh-card"><div class="cc-head"><div class="cc-t">Live trades</div></div><div class="tr-empty">No live trades yet · place trades in the Terminal and they appear here — tagged by source and timed.</div></div>'
  return '<div class="dh-card"><div class="cc-head"><div class="cc-t">Live trades</div><span class="dim" style="font-size:11px">' + open.length + ' open · ' + closed.length + ' closed</span></div>' +
    '<table class="tr-tab"><thead><tr><th>Market</th><th>Side</th><th>From</th><th class="r">Result</th><th class="r">P&amp;L</th></tr></thead><tbody>' +
    open.slice(0, 3).map((p) => { const price = S.instr[p.sym].price, prog = p.dir === 'up' ? (price - p.entry) / (p.entry - p.sl) : (p.entry - price) / (p.sl - p.entry), pnl = prog * p.risk; return '<tr><td class="mono">' + p.sym + '</td><td class="' + (p.dir === 'up' ? 'up' : 'down') + '">' + (p.dir === 'up' ? 'Buy' : 'Sell') + '</td><td>' + srcTag(p.src) + '</td><td class="r"><span class="tr-live">● live</span></td><td class="r mono ' + (pnl >= 0 ? 'up' : 'down') + '">' + (pnl >= 0 ? '+' : '-') + gbp2(Math.abs(pnl)) + '</td></tr>' }).join('') +
    closed.slice(0, 6).map((t) => '<tr><td class="mono">' + t.sym + '</td><td class="' + (t.dir === 'up' ? 'up' : 'down') + '">' + (t.dir === 'up' ? 'Buy' : 'Sell') + '</td><td>' + srcTag(t.src) + '</td><td class="r ' + (t.result === 'win' ? 'up' : t.result === 'be' ? '' : 'down') + '">' + (t.result === 'win' ? 'Win' : t.result === 'be' ? 'BE' : 'Loss') + '</td><td class="r mono ' + (t.amt >= 0 ? 'up' : 'down') + '">' + (t.amt >= 0 ? '+' : '-') + gbp2(Math.abs(t.amt)) + '</td></tr>').join('') +
    '</tbody></table></div>'
}
export function tradesCardHTML(S, set) {
  const open = liveOpen(S, set), closed = liveClosed(S, set)
  const w = closed.filter((t) => t.result === 'win'), l = closed.filter((t) => t.result === 'loss')
  const gW = w.reduce((s, t) => s + t.amt, 0), gL = Math.abs(l.reduce((s, t) => s + t.amt, 0))
  const wr = (w.length + l.length) ? w.length / (w.length + l.length) * 100 : 0, pf = gL > 0 ? gW / gL : (gW > 0 ? 99 : 0)
  const best = closed.length ? Math.max.apply(null, closed.map((t) => t.amt)) : 0, worst = closed.length ? Math.min.apply(null, closed.map((t) => t.amt)) : 0
  const rs = closed.map((t) => t.result === 'win' ? (t.rr || 1) : (t.result === 'be' ? 0 : -1)), avgR = rs.length ? rs.reduce((s, x) => s + x, 0) / rs.length : 0
  const ideaT = closed.filter((t) => t.src && t.src.t === 'idea'), manT = closed.filter((t) => !(t.src && t.src.t === 'idea')), tt = (ideaT.length + manT.length) || 1
  const sc = (l2, v, sign) => '<div class="trs"><span>' + l2 + '</span><b' + (sign > 0 ? ' class="up"' : sign < 0 ? ' class="down"' : '') + '>' + v + '</b></div>'
  const strip = '<div class="tr-stats">' + sc('Trades', (closed.length + open.length) + '') + sc('Win rate', wr.toFixed(0) + '%') + sc('Profit factor', pf >= 99 ? '∞' : pf.toFixed(2)) + sc('Avg R', (avgR >= 0 ? '+' : '') + avgR.toFixed(2) + 'R', avgR) + sc('Best', money(best), best) + sc('Worst', money(worst), worst) + '</div>'
  const openTbl = open.length ? ('<div class="tr-sub">Open positions <span class="dim">' + open.length + '</span></div><table class="tr-tab"><thead><tr><th>Market</th><th>Side</th><th>From</th><th class="r">Entry</th><th class="r">P&amp;L</th></tr></thead><tbody>' +
    open.map((p) => { const price = S.instr[p.sym].price, prog = p.dir === 'up' ? (price - p.entry) / (p.entry - p.sl) : (p.entry - price) / (p.sl - p.entry), pnl = prog * p.risk; return '<tr><td class="mono">' + p.sym + (p.be ? ' <span class="tmpx-be">BE</span>' : '') + '</td><td class="' + (p.dir === 'up' ? 'up' : 'down') + '">' + (p.dir === 'up' ? 'Buy' : 'Sell') + '</td><td>' + srcTag(p.src) + '</td><td class="r mono">' + pxv(p.entry) + '</td><td class="r mono ' + (pnl >= 0 ? 'up' : 'down') + '">' + (pnl >= 0 ? '+' : '-') + gbp2(Math.abs(pnl)) + '</td></tr>' }).join('') + '</tbody></table>') : ''
  const histTbl = closed.length ? ('<div class="tr-sub">Trade history <span class="dim">' + closed.length + '</span></div><table class="tr-tab tr-hist"><thead><tr><th>When</th><th>Market</th><th>Side</th><th>From</th><th class="r">R:R</th><th class="r">Result</th><th class="r">P&amp;L</th></tr></thead><tbody>' +
    closed.slice(0, 40).map((t) => { const rl = t.result === 'win' ? 'Win' : t.result === 'be' ? 'BE' : 'Loss', rc = t.result === 'win' ? 'up' : t.result === 'be' ? '' : 'down'; return '<tr><td class="mono dim">' + tago(t.closedAt) + '</td><td class="mono">' + t.sym + '</td><td class="' + (t.dir === 'up' ? 'up' : 'down') + '">' + (t.dir === 'up' ? 'Buy' : 'Sell') + '</td><td>' + srcTag(t.src) + '</td><td class="r mono">1:' + Number(t.rr || 0).toFixed(1) + '</td><td class="r ' + rc + '">' + rl + '</td><td class="r mono ' + (t.amt >= 0 ? 'up' : 'down') + '">' + (t.amt >= 0 ? '+' : '-') + gbp2(Math.abs(t.amt)) + '</td></tr>' }).join('') + '</tbody></table>') :
    '<div class="tr-empty">No closed trades on this account yet · settle a trade in the Terminal and it lands here, tagged by source.</div>'
  const split = closed.length ? ('<div class="tr-split"><div class="trsp-h">Where your trades came from</div>' +
    '<div class="trsp-row"><span class="trsp-l"><span class="trsp-d idea"></span>Ideas</span><div class="trsp-bar"><span class="idea" style="width:' + (ideaT.length / tt * 100) + '%"></span></div><span class="trsp-v mono">' + ideaT.length + '</span></div>' +
    '<div class="trsp-row"><span class="trsp-l"><span class="trsp-d man"></span>Manual</span><div class="trsp-bar"><span class="man" style="width:' + (manT.length / tt * 100) + '%"></span></div><span class="trsp-v mono">' + manT.length + '</span></div></div>') : ''
  return '<div class="dh-card"><div class="cc-head"><div class="cc-t">Live trades</div><span class="dim" style="font-size:11px">your real terminal activity</span></div>' + strip + openTbl + histTbl + split + '</div>'
}

// ---- canvas chart ----
export function drawPerfChart(S, c) {
  if (!c) return
  const dpr = window.devicePixelRatio || 1
  const w = c.clientWidth, h = c.clientHeight || 360; c.width = w * dpr; c.height = h * dpr
  const ctx = c.getContext('2d'); ctx.scale(dpr, dpr); ctx.clearRect(0, 0, w, h)
  const set = perfSet(S)
  const eqRaw = rangeSlice(S, perfSeries(set)), balRaw = rangeSlice(S, perfBalSeries(set)), base = perfStart(set)
  if (eqRaw.length < 2) { ctx.fillStyle = '#3a3a3f'; ctx.font = '12px Inter'; ctx.textAlign = 'center'; ctx.fillText('No history yet', w / 2, h / 2); return }
  const conv = (v) => S.perfUnit === 'usd' ? v : (v - base) / base * 100
  const eq = eqRaw.map(conv), bal = balRaw.map(conv), all = eq.concat(bal)
  let min = Math.min.apply(null, all), max = Math.max.apply(null, all); if (min === max) { min -= 1; max += 1 }
  const p = (max - min) * 0.10; min -= p; max += p; const rng = max - min
  const padL = 50, padB = 22, padT = 10, gw = w - padL - 10, gh = h - padB - padT
  ctx.font = '9px JetBrains Mono'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'
  for (let g = 0; g <= 4; g++) { const yy = padT + gh * g / 4, val = max - rng * g / 4; ctx.strokeStyle = LT() ? '#eceef1' : '#15171a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(padL, yy); ctx.lineTo(w - 10, yy); ctx.stroke(); ctx.fillStyle = '#565b62'; ctx.fillText(S.perfUnit === 'usd' ? fmt(val) : (val.toFixed(0) + '%'), padL - 7, yy) }
  const path = (arr) => { ctx.beginPath(); arr.forEach((v, i) => { const x = padL + i / (arr.length - 1) * gw, y = padT + gh - ((v - min) / rng) * gh; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y) }) }
  path(eq); const grad = ctx.createLinearGradient(0, padT, 0, padT + gh); grad.addColorStop(0, LT() ? 'rgba(16,168,120,0.16)' : 'rgba(127,179,154,0.20)'); grad.addColorStop(1, LT() ? 'rgba(16,168,120,0)' : 'rgba(127,179,154,0)')
  ctx.lineTo(padL + gw, padT + gh); ctx.lineTo(padL, padT + gh); ctx.closePath(); ctx.fillStyle = grad; ctx.fill()
  path(bal); ctx.strokeStyle = LT() ? '#9aa6c2' : '#7c8196'; ctx.lineWidth = 1.2; ctx.stroke()
  path(eq); ctx.strokeStyle = LT() ? '#10a878' : '#7fb39a'; ctx.lineWidth = 2.1; ctx.stroke()
  ctx.textAlign = 'center'; ctx.fillStyle = '#565b62'
  const joined = Math.min.apply(null, set.map((a) => a.openedAt))
  const spanD = ({ '1d': 1, '1w': 7, '1m': 30, '6m': 180, ytd: 180, '1y': 365, max: Math.max(30, (Date.now() - joined) / 86400000) })[S.perfRange] || 30
  ;[0, 0.5, 1].forEach((fr) => { const x = padL + fr * gw; const dt = new Date(Date.now() - (1 - fr) * spanD * 86400000); ctx.fillText(dt.toISOString().slice(0, 10), x, h - 8) })
}
