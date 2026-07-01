// Verbatim-ported chunk builders (rows/cards) that return HTML strings.
// React view components assemble these via the <Html> helper for pixel fidelity.
import { fmt, money, pct, flagEmoji, avSeed } from './format.js'
import { medalIcon } from './icons.js'
import { ORD3, PCT } from './data.js'
import { eqOf, unrl, retOf, rankFor, prizeFor, active } from './sim.js'

// Leaderboard rows for the compact global board (home / tournament).
export function lbRows(arr, n, withDD) {
  return arr.slice(0, n).map((r) => {
    const mv = r.mv > 0 ? '<td class="mv up">▲ ' + r.mv + '</td>' : r.mv < 0 ? '<td class="mv down">▼ ' + (-r.mv) + '</td>' : '<td class="mv fl">—</td>'
    return '<tr class="' + (r.you ? 'you' : '') + '" data-trader="' + r.handle + '"><td class="rk">' + r.rank + '</td>' + mv +
      '<td><div class="trd"><div class="a">' + r.handle.slice(0, 2).toUpperCase() + '</div><div class="h">' + r.handle + (r.you ? ' · you' : '') + '</div></div></td>' +
      '<td class="dim"><span class="flag">' + flagEmoji(r.country) + '</span> ' + r.country + '</td><td class="r tn">' + r.score + '</td><td class="r ' + (r.ret >= 0 ? 'up' : 'down') + ' tn">' + pct(r.ret) + '</td>' +
      '<td class="r tn hold">' + (r.prize > 0 ? money(r.prize) : '<span class="dim">—</span>') + '</td>' +
      (withDD ? '<td class="r dim tn">' + r.dd.toFixed(1) + '%</td>' : '') + '</tr>'
  }).join('')
}

// Account table rows (home account hub).
export function acctRows(S) {
  return S.accounts.map((a) => {
    const eq = eqOf(S, a), pnl = a.closed + unrl(S, a), r = retOf(S, a), rk = rankFor(S, a), act = a.id === S.activeId, itm = rk <= 10
    const status = act ? '<span class="pill act"><span class="dot"></span>Active</span>' : itm ? '<span class="pill itm"><span class="dot"></span>In money</span>' : '<span class="pill"><span class="dot"></span>Live</span>'
    return '<tr class="' + (act ? 'active' : '') + '" data-acc="' + a.id + '">' +
      '<td><div class="acctn"><span class="ac-id">' + a.id + '</span><span class="ac-cad">' + a.cadence + ' · ' + a.positions.length + ' open</span></div></td>' +
      '<td class="r tn">£' + a.entry + '</td>' +
      '<td class="r tn">' + money(eq) + '</td>' +
      '<td class="r tn ' + (pnl >= 0 ? 'up' : 'down') + '">' + money(pnl) + '</td>' +
      '<td class="r tn ' + (r >= 0 ? 'up' : 'down') + '">' + pct(r) + '</td>' +
      '<td class="r tn">#' + rk + '</td>' +
      '<td class="r tn hold">' + (itm ? money(prizeFor(S, rk)) : '<span class="dim">—</span>') + '</td>' +
      '<td class="r">' + status + '</td>' +
      '<td class="r"><button class="xb" data-trade-acc="' + a.id + '">View</button></td></tr>'
  }).join('')
}

// Tournament-field player row (leaderboard columns).
export function plrow(S, p) {
  const ini = (p.name.match(/[A-Za-z]/) || ['?'])[0].toUpperCase()
  const top = p.rank <= 3
  if (top) {
    return '<div class="plr top t' + p.rank + (p.you ? ' you' : '') + '" data-trader="' + p.name + '"><span class="plmedal m' + p.rank + '">' + medalIcon(p.rank) + '</span><span class="plav" style="background:' + avSeed(p.name) + '">' + ini + '</span><span class="plnm"><span class="plflag">' + flagEmoji(p.country) + '</span>' + p.name + (p.you ? ' · you' : '') + '<span class="pltag">' + ORD3[p.rank - 1] + '</span></span><span class="plwin tn">' + fmt(prizeFor(S, p.rank)) + '</span></div>'
  }
  return '<div class="plr' + (p.you ? ' you' : '') + '" data-trader="' + p.name + '"><span class="plrk">' + String(p.rank).padStart(2, '0') + '</span><span class="plav" style="background:' + avSeed(p.name) + '">' + ini + '</span><span class="plnm"><span class="plflag">' + flagEmoji(p.country) + '</span>' + p.name + (p.you ? ' · you' : '') + '</span><span class="plval tn">' + money(p.val) + '</span></div>'
}

// Four-row mini leaderboard used on tournament hero.
export function miniLb(field) {
  return field.slice(0, 4).map((p, i) => {
    const ini = (p.name.match(/[A-Za-z]/) || ['?'])[0].toUpperCase()
    return '<div class="llbr" data-trader="' + p.name + '"><span class="llbrk">' + String(i + 1).padStart(2, '0') + '</span><div class="trd"><div class="a" style="background:' + avSeed(p.name) + '">' + ini + '</div><div class="h"><span class="plflag">' + flagEmoji(p.country) + '</span>' + p.name + (p.you ? ' · you' : '') + '</div></div><span class="llbv tn">' + money(p.val) + '</span></div>'
  }).join('')
}

export { PCT }
