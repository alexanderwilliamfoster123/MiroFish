// Invites hub (arena battle challenges + competition invites), ported from the prototype.
import { fmt, avSeed } from './format.js'
import { hallData, hdRng, hdHash, avEmoji } from './builders2.js'

export function ensureInvites(S) {
  if (S.invites) return S.invites
  const hs = hallData()
  const mk = (h, seed, st) => {
    const r = hdRng(hdHash(h + 'inv' + seed))
    const win = ['15m', '1h', '4h', '1d', '1w', '1y'][Math.floor(r() * 6)]
    const stake = [100, 1000, 10000, 100000][Math.floor(r() * 4)]
    const odds = 1 + Math.floor(r() * 5), their = Math.max(1, Math.round(stake / odds))
    const kick = ['Now', 'Today 20:00', 'Tmrw 09:00', 'Tmrw 20:00'][Math.floor(r() * 4)]
    const ago = ['2m', '9m', '41m', '2h', '5h', '1d'][seed % 6]
    return { id: 'iv' + seed, who: h, win, stake, their, odds, kick, when: ago, status: st }
  }
  const _TI = [{ tour: 'Daily Sprint', cad: 'Daily' }, { tour: 'Weekly Open', cad: 'Weekly' }, { tour: 'July Global Open', cad: 'Monthly' }, { tour: 'Q3 Championship', cad: 'Quarterly' }, { tour: '2026 World Series', cad: 'Yearly' }]
  const mkc = (h, seed, st, ti) => { const ago = ['3m', '12m', '40m', '3h', '6h', '1d'][seed % 6]; return { id: 'ci' + seed, who: h, tour: _TI[ti].tour, cad: _TI[ti].cad, buyin: 25, when: ago, status: st } }
  S.invites = { tab: 'received', seg: 'arena', comptab: 'sent', received: [mk(hs[1].handle, 1, 'pending'), mk(hs[4].handle, 2, 'pending'), mk(hs[7].handle, 3, 'pending')], sent: [mk(hs[2].handle, 11, 'pending'), mk(hs[5].handle, 12, 'accepted'), mk(hs[9].handle, 13, 'declined')], compReceived: [mkc(hs[3].handle, 21, 'pending', 1), mkc(hs[6].handle, 22, 'pending', 3)], compSent: [mkc(hs[0].handle, 31, 'pending', 4), mkc(hs[8].handle, 32, 'accepted', 1), mkc(hs[2].handle, 33, 'declined', 0)] }
  return S.invites
}
export const invPending = (S) => ensureInvites(S).received.filter((x) => x.status === 'pending').length
export const invCompPending = (S) => ensureInvites(S).compReceived.filter((x) => x.status === 'pending').length
export const invTotalPending = (S) => invPending(S) + invCompPending(S)
const inviteWL = (w) => ({ '15m': '15m', '1h': '1h', '4h': '4h', '1d': '1-day', '1w': '1-week', '1mo': '1-month', '1y': '1-year' })[w] || w
const invEmpty = (m) => '<div class="inv-empty">' + m + '</div>'

function inviteReceivedCard(S, iv) {
  const pot = iv.stake + iv.their
  const act = iv.status === 'pending' ? '<div class="inv-actions"><button class="inv-decline" data-invdecline="' + iv.id + '">Decline</button><button class="inv-accept" data-invaccept="' + iv.id + '">Accept →</button></div>' : '<div class="inv-resolved ' + iv.status + '">' + (iv.status === 'accepted' ? '✓ Accepted' : 'Declined') + '</div>'
  return '<div class="inv-card' + (iv.status !== 'pending' ? ' done' : '') + '"><div class="inv-top"><span class="inv-av" data-trader="' + iv.who + '" style="background:' + avSeed(iv.who) + '">' + avEmoji(S, iv.who) + '</span><div class="inv-meta"><div class="inv-name">' + iv.who + ' <span class="inv-ago">· ' + iv.when + ' ago</span></div><div class="inv-terms">challenged you to a ' + inviteWL(iv.win) + ' battle</div></div><span class="inv-pot">' + fmt(pot) + ' pot</span></div>' +
    '<div class="inv-detail">You put up <b>' + fmt(iv.their) + '</b>' + (iv.odds > 1 ? ' · they gave you 1:' + iv.odds + ' (R:R)' : ' · even match') + ' · kicks off ' + iv.kick + '</div>' + act + '</div>'
}
function inviteSentCard(S, iv) {
  const lbl = iv.status === 'pending' ? 'Waiting' : (iv.status === 'accepted' ? '✓ Accepted' : (iv.status === 'cancelled' ? 'Cancelled' : 'Declined'))
  const act = iv.status === 'pending' ? '<div class="inv-actions"><button class="inv-cancel" data-invcancel="' + iv.id + '">Cancel invite</button></div>' : ''
  return '<div class="inv-card' + (iv.status !== 'pending' ? ' done' : '') + '"><div class="inv-top"><span class="inv-av" data-trader="' + iv.who + '" style="background:' + avSeed(iv.who) + '">' + avEmoji(S, iv.who) + '</span><div class="inv-meta"><div class="inv-name">to ' + iv.who + ' <span class="inv-ago">· ' + iv.when + ' ago</span></div><div class="inv-terms">your ' + inviteWL(iv.win) + ' challenge</div></div><span class="inv-status ' + iv.status + '">' + lbl + '</span></div>' +
    '<div class="inv-detail">You staked <b>' + fmt(iv.stake) + '</b>' + (iv.odds > 1 ? ' · 1:' + iv.odds + ' R:R' : '') + ' · kicks off ' + iv.kick + '</div>' + act + '</div>'
}
function compReceivedCard(S, iv) {
  const act = iv.status === 'pending' ? '<div class="inv-actions"><button class="inv-decline" data-compdecline="' + iv.id + '">Decline</button><button class="inv-accept" data-compjoin="' + iv.id + '">Join →</button></div>' : '<div class="inv-resolved ' + iv.status + '">' + (iv.status === 'accepted' ? '✓ Joined' : 'Declined') + '</div>'
  return '<div class="inv-card' + (iv.status !== 'pending' ? ' done' : '') + '"><div class="inv-top"><span class="inv-av" data-trader="' + iv.who + '" style="background:' + avSeed(iv.who) + '">' + avEmoji(S, iv.who) + '</span><div class="inv-meta"><div class="inv-name">' + iv.who + ' <span class="inv-ago">· ' + iv.when + ' ago</span></div><div class="inv-terms">invited you to <b>' + iv.tour + '</b></div></div><span class="inv-pot">' + iv.cad + '</span></div>' +
    '<div class="inv-detail">Buy-in <b>' + fmt(iv.buyin) + '</b> · ' + iv.cad + ' competition</div>' + act + '</div>'
}
function compSentCard(S, iv) {
  const lbl = iv.status === 'pending' ? 'Waiting' : (iv.status === 'accepted' ? '✓ Joined' : (iv.status === 'cancelled' ? 'Cancelled' : 'Declined'))
  const act = iv.status === 'pending' ? '<div class="inv-actions"><button class="inv-cancel" data-compcancel="' + iv.id + '">Cancel invite</button></div>' : ''
  return '<div class="inv-card' + (iv.status !== 'pending' ? ' done' : '') + '"><div class="inv-top"><span class="inv-av" data-trader="' + iv.who + '" style="background:' + avSeed(iv.who) + '">' + avEmoji(S, iv.who) + '</span><div class="inv-meta"><div class="inv-name">to ' + iv.who + ' <span class="inv-ago">· ' + iv.when + ' ago</span></div><div class="inv-terms">invite to <b>' + iv.tour + '</b></div></div><span class="inv-status ' + iv.status + '">' + lbl + '</span></div>' +
    '<div class="inv-detail">Buy-in <b>' + fmt(iv.buyin) + '</b> · ' + (iv.cad || 'Open') + ' competition</div>' + act + '</div>'
}

export function invitesHub(S) {
  const I = ensureInvites(S); const seg = I.seg || 'arena'; const aP = invPending(S), cP = invCompPending(S)
  const segCtl = '<div class="invhub-seg"><button class="invhub-segb' + (seg === 'arena' ? ' on' : '') + '" data-invseg="arena">Arena battles' + (aP ? ' <span class="inv-badge">' + aP + '</span>' : '') + '</button><button class="invhub-segb' + (seg === 'comp' ? ' on' : '') + '" data-invseg="comp">Competitions' + (cP ? ' <span class="inv-badge">' + cP + '</span>' : '') + '</button></div>'
  let body
  if (seg === 'arena') {
    const tab = I.tab || 'received'
    const subs = '<div class="inv-tabs"><button class="inv-tab' + (tab === 'received' ? ' on' : '') + '" data-invtab="received">Received' + (aP ? ' <span class="inv-badge">' + aP + '</span>' : '') + '</button><button class="inv-tab' + (tab === 'sent' ? ' on' : '') + '" data-invtab="sent">Sent</button></div>'
    const list = tab === 'received' ? (I.received.length ? I.received.map((iv) => inviteReceivedCard(S, iv)).join('') : invEmpty('No battle invites right now — challenge someone from the Arena.')) : (I.sent.length ? I.sent.map((iv) => inviteSentCard(S, iv)).join('') : invEmpty('You have not sent any battle challenges yet.'))
    body = '<div class="invhub-bar">' + subs + '<button class="tinvite sm" data-compinvite="">New battle →</button></div><div class="inv-list">' + list + '</div>'
  } else {
    const ct = I.comptab || 'sent'
    const subs = '<div class="inv-tabs"><button class="inv-tab' + (ct === 'received' ? ' on' : '') + '" data-invctab="received">Received' + (cP ? ' <span class="inv-badge">' + cP + '</span>' : '') + '</button><button class="inv-tab' + (ct === 'sent' ? ' on' : '') + '" data-invctab="sent">Sent</button></div>'
    const list = ct === 'received' ? (I.compReceived.length ? I.compReceived.map((iv) => compReceivedCard(S, iv)).join('') : invEmpty('No competition invites right now.')) : (I.compSent.length ? I.compSent.map((iv) => compSentCard(S, iv)).join('') : invEmpty('You have not invited anyone to a competition yet.'))
    body = '<div class="invhub-bar">' + subs + '<button class="tinvite sm" data-compinvite="">Invite friends →</button></div><div class="inv-list">' + list + '</div>'
  }
  return '<div class="invhub"><div class="invhub-head"><h1 class="invhub-title">Invites</h1><p class="invhub-sub">Every battle challenge and competition invite — sent and received — in one place.</p></div>' + segCtl + body + '</div>'
}
