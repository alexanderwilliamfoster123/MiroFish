// Social feed builders, ported from the prototype.
import { fmt, avSeed, kfmt } from './format.js'
import { PCT } from './data.js'
import { hallData, hdRng, hdHash, avEmoji } from './builders2.js'
import { FD_ORDER, FD_ASSETS, FD_BLIVE, FD_CALL, FD_RESW, FD_MEDIA, FD_THT, THOUGHTS, THT_ASSETS, VTICK, REPLY_SVG, RT_SVG, HEART_SVG, VIEW_SVG, SHARE_SVG } from './_feeddata.js'

export function traderThoughts(h) {
  const r = hdRng(hdHash(h) ^ 0x71c); const out = []
  for (let i = 0; i < 3; i++) { const t = THOUGHTS[Math.floor(r() * THOUGHTS.length)].replace('{a}', THT_ASSETS[Math.floor(r() * THT_ASSETS.length)]); out.push({ t, likes: 8 + Math.floor(r() * 1400), when: [1, 2, 3, 5, 8, 13, 21][Math.floor(r() * 7)] + 'd ago' }) }
  return out
}

export function feedData() {
  const items = [], hs = hallData(), TOURS = ['the Monthly Global Open', 'the Weekly Open', 'the Daily Sprint', 'the Q3 Championship'], BADGES = ['7-Figure Club', 'Arena Champion', 'Sniper', 'Centurion', 'Diamond Hands'], POTW = [1000, 4000, 20000, 100000, 1000000]
  for (let i = 0; i < 20; i++) {
    const r = hdRng(hdHash('feed' + i)); const u = hs[Math.floor(r() * hs.length)]; const ty = FD_ORDER[i] || 'thought'
    const _wi = Math.floor(r() * 5), w = ['15m', '1h', '4h', '1 day', '1 week'][_wi], wk = ['15m', '1h', '4h', '1d', '1w'][_wi]
    const potN = [1000, 4000, 20000, 100000][Math.floor(r() * 4)], pot = fmt(potN)
    const mins = [2, 5, 9, 14, 28, 55, 90, 180, 420][Math.floor(r() * 9)]; const whenL = mins < 60 ? mins + 'm' : (mins < 1440 ? Math.round(mins / 60) + 'h' : Math.round(mins / 1440) + 'd')
    const it = { id: 'f' + i, h: u.handle, cc: u.country, ty, when: whenL, likes: 5 + Math.floor(r() * 1900), replies: Math.floor(r() * 240), reposts: Math.floor(r() * 120), views: 300 + Math.floor(r() * 52000) }
    if (ty === 'callout') {
      if (r() > 0.5) { let bi = Math.floor(r() * hs.length); if (hs[bi].handle === u.handle) bi = (bi + 1) % hs.length; it.live = true; it.fa = u.handle; it.fb = hs[bi].handle; it.ra = (r() * 9 - 3).toFixed(1); it.rb = (r() * 9 - 3).toFixed(1); it.window = w; it.pot = pot; it.text = FD_BLIVE[Math.floor(r() * FD_BLIVE.length)].split('{a}').join(it.fa).split('{b}').join(it.fb) }
      else { it.text = FD_CALL[Math.floor(r() * FD_CALL.length)].split('{w}').join(w).split('{p}').join(pot); it.opp = u.handle; it.window = w; it.pot = pot; it.wk = wk; it.potN = potN; it.inst = ['Bitcoin · BTC/USD', 'Ethereum · ETH/USD', 'Gold · XAU/USD', 'EUR/USD', 'Nasdaq · US100'][hdHash(u.handle + 'fi') % 5] }
    } else if (ty === 'result') {
      if (r() > 0.42) { const o = hs[Math.floor(r() * hs.length)].handle; it.text = FD_RESW[Math.floor(r() * FD_RESW.length)].split('{o}').join(o); it.res = 'W'; it.opp = o; it.ret = '+' + (0.5 + r() * 4).toFixed(2) + '%'; it.potN2 = POTW[Math.floor(r() * POTW.length)] }
      else { it.rank = 1 + Math.floor(r() * 9); const tt = TOURS[Math.floor(r() * TOURS.length)]; it.text = 'Finished #' + it.rank + ' in ' + tt + '.'; it.tour = tt.replace('the ', ''); it.prize = it.rank <= 10 ? Math.round([62500, 250000, 842000, 18400][Math.floor(r() * 4)] * PCT[it.rank - 1] / 100) : 0 }
    } else if (ty === 'unlock') { it.badge = BADGES[Math.floor(r() * BADGES.length)]; it.text = 'just unlocked ' + it.badge + '.' }
    else if (ty === 'media') { it.text = FD_MEDIA[Math.floor(r() * FD_MEDIA.length)]; it.media = { type: (r() > 0.5 ? 'video' : 'image'), seed: hdHash(u.handle + 'med' + i), dur: [12, 28, 45, 63][Math.floor(r() * 4)] } }
    else { it.text = FD_THT[Math.floor(r() * FD_THT.length)] }
    items.push(it)
  }
  return items
}

export function postCard(S, o) {
  const liked = S.feedLikes && S.feedLikes[o.id]; const likeN = (o.likes || 0) + (liked ? 1 : 0)
  const rt = S.feedRT && S.feedRT[o.id]; const rtN = (o.reposts || 0) + (rt ? 1 : 0)
  return '<div class="fd-item"><span class="fd-av" data-trader="' + o.h + '" style="background:' + avSeed(o.h) + '">' + avEmoji(S, o.h) + '</span><div class="fd-body">' +
    '<div class="fd-head"><b class="fd-name" data-trader="' + o.h + '">' + o.h + '</b>' + VTICK + '<span class="fd-handle">@' + o.h.toLowerCase() + '</span><span class="fd-time">· ' + o.when + '</span></div>' +
    '<div class="fd-text">' + o.text + '</div>' + (o.extra || '') + (o.media ? feedMedia(o.media) : '') +
    '<div class="fd-actions"><button class="fd-act" data-fdreply="' + o.h + '">' + REPLY_SVG + kfmt(o.replies || 0) + '</button>' +
    '<button class="fd-act' + (rt ? ' rt' : '') + '" data-fdrepost="' + o.id + '">' + RT_SVG + kfmt(rtN) + '</button>' +
    '<button class="fd-act' + (liked ? ' on' : '') + '" data-fdlike="' + o.id + '">' + HEART_SVG + kfmt(likeN) + '</button>' +
    '<span class="fd-act fd-views">' + VIEW_SVG + kfmt(o.views || 0) + '</span>' +
    '<button class="fd-act" data-fdshare>' + SHARE_SVG + '</button></div></div></div>'
}

export function feedMedia(m) {
  const r = hdRng((m.seed || 1) >>> 0); const win = r() > 0.4; const col = win ? '#1f9d57' : '#e5484d'; const fade = win ? 'rgba(31,157,87,' : 'rgba(229,72,77,'; const id = 'fm' + ((m.seed || 1) >>> 0)
  const N = 30, W = 480, H = 240, pad = 20, ys = []; let v = H * 0.6
  for (let k = 0; k < N; k++) { v += (r() - (win ? 0.56 : 0.44)) * 15; if (v < pad) v = pad; if (v > H - pad) v = H - pad; ys.push(v) }
  const X = (i) => (pad + (W - 2 * pad) * i / (N - 1)).toFixed(1)
  let line = 'M' + X(0) + ',' + ys[0].toFixed(1); for (let jj = 1; jj < N; jj++) line += ' L' + X(jj) + ',' + ys[jj].toFixed(1)
  const area = line + ' L' + X(N - 1) + ',' + H + ' L' + X(0) + ',' + H + ' Z'
  let grid = ''; for (let g = 1; g < 3; g++) { const gy = (H * g / 3).toFixed(1); grid += '<line x1="' + pad + '" y1="' + gy + '" x2="' + (W - pad) + '" y2="' + gy + '" stroke="rgba(255,255,255,.06)" stroke-width="1"/>' }
  const ret = (win ? '+' : '-') + (1 + r() * 18).toFixed(1) + '%'
  const chart = '<svg class="fd-media-chart" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + fade + '.30)"/><stop offset="1" stop-color="' + fade + '0)"/></linearGradient></defs>' + grid + '<path d="' + area + '" fill="url(#' + id + ')"/><path d="' + line + '" fill="none" stroke="' + col + '" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/></svg>'
  const badge = '<span class="fd-media-ret" style="color:' + col + '">' + ret + '</span>'
  const ov = (m.type === 'video') ? '<div class="fd-media-play"><svg viewBox="0 0 24 24"><path d="M8 5l12 7-12 7z" fill="#fff"/></svg></div><span class="fd-media-dur">0:' + (m.dur < 10 ? '0' + m.dur : m.dur) + '</span>' : ''
  return '<div class="fd-media">' + chart + badge + ov + '</div>'
}

export function battleEmbed(S, it) { return '<div class="fd-battle"><div class="fd-bt-row"><span class="fd-bt-f"><span class="fd-bt-av" style="background:' + avSeed(it.h) + '">' + avEmoji(S, it.h) + '</span><b>' + it.h + '</b></span><span class="fd-bt-vs">VS</span><span class="fd-bt-f open"><span class="fd-bt-av ghost">?</span><span class="fd-bt-open">open seat</span></span></div><div class="fd-bt-foot"><span class="fd-bt-meta">' + it.window + ' · ' + it.pot + ' pot</span><button class="fd-accept" data-fdaccept="' + it.opp + '|' + (it.wk || '1h') + '|' + (it.potN || 1000) + '|' + (it.inst || 'Bitcoin · BTC/USD') + '">Accept battle →</button></div></div>' }
export function resultEmbed(S, it) {
  if (it.res === 'W') return '<div class="fd-result"><div class="fd-rs-row"><span class="fd-bt-f"><span class="fd-bt-av" style="background:' + avSeed(it.h) + '">' + avEmoji(S, it.h) + '</span><b>' + it.h + '</b><span class="fd-rs-won">WON</span></span><span class="fd-bt-vs">beat</span><span class="fd-bt-f"><span class="fd-bt-av" style="background:' + avSeed(it.opp) + '">' + avEmoji(S, it.opp) + '</span><span class="fd-rs-dim">' + it.opp + '</span></span></div><div class="fd-bt-foot"><span class="fd-rs-ret">▲ ' + it.ret + '</span><span class="fd-bt-meta">' + fmt(it.potN2 || 1000) + ' pot</span></div></div>'
  return '<div class="fd-result fin"><span class="fd-rs-trophy">🏆</span><div><div class="fd-rs-fin">Finished #' + it.rank + ' · ' + (it.tour || 'tournament') + '</div>' + (it.prize ? '<div class="fd-rs-prize">Won ' + fmt(it.prize) + '</div>' : '') + '</div></div>'
}
export function liveBattleEmbed(S, it) { const ra = parseFloat(it.ra), rb = parseFloat(it.rb); const lead = Math.max(8, Math.min(92, 50 + (ra - rb) * 9)); return '<div class="fd-battle"><div class="fd-bt-row"><span class="fd-bt-f"><span class="fd-bt-av" data-trader="' + it.fa + '" style="background:' + avSeed(it.fa) + '">' + avEmoji(S, it.fa) + '</span><b>' + it.fa + '</b><span class="fd-bt-ret ' + (ra >= 0 ? 'up' : 'down') + '">' + (ra >= 0 ? '+' : '') + ra + '%</span></span><span class="fd-bt-vs">VS</span><span class="fd-bt-f"><span class="fd-bt-av" data-trader="' + it.fb + '" style="background:' + avSeed(it.fb) + '">' + avEmoji(S, it.fb) + '</span><b>' + it.fb + '</b><span class="fd-bt-ret ' + (rb >= 0 ? 'up' : 'down') + '">' + (rb >= 0 ? '+' : '') + rb + '%</span></span></div><div class="fd-bt-leadbar"><span style="width:' + lead.toFixed(0) + '%"></span></div><div class="fd-bt-foot"><span class="fd-bt-meta"><span class="fd-bt-livedot"></span>LIVE · ' + it.window + ' · ' + it.pot + ' pot</span><button class="fd-accept" data-arwatch="' + it.fa + '-' + it.fb + '">Watch live →</button></div></div>' }

export function feedItemHTML(S, it) {
  let extra = ''
  if (it.ty === 'callout') extra = it.live ? liveBattleEmbed(S, it) : battleEmbed(S, it)
  else if (it.ty === 'result') extra = resultEmbed(S, it)
  else if (it.ty === 'unlock') extra = '<span class="fd-pill purp">⭐ ' + it.badge + '</span>'
  return postCard(S, { id: it.id, h: it.h, when: it.when, text: it.text, likes: it.likes, replies: it.replies, reposts: it.reposts, views: it.views, extra, media: it.media })
}
