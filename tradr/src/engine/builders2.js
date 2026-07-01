// More verbatim-ported chunk builders: tournament cards, past events, hall of fame, avatars.
import { fmt, money, flagEmoji, avSeed, fmtCountdown, cdColor } from './format.js'
import { cadTint, cadIcon, pheroTint, pheroMark } from './icons.js'
import { PAST, PCT, TOUR_TOTAL } from './data.js'

const entrants = (pool) => Math.round(pool / 25)

export function hdRng(seed) { let sd = (seed >>> 0) || 1; return () => { sd = (sd * 1103515245 + 12345) >>> 0; return sd / 4294967296 } }
export function hdHash(x) { x = String(x); let h = 0; for (let i = 0; i < x.length; i++) h = (h * 131 + x.charCodeAt(i)) >>> 0; return h }

export const AV_EMOJI = ['🦅', '🐺', '🦈', '🐉', '🦁', '🐂', '🐻', '🦊', '🚀', '⚡', '🔥', '💎', '🎯', '👑', '🧠', '🌊', '⭐', '🐅', '🦏', '🪐']
export const HALL_USERS = ['Theo4', 'Fredi9999', 'swisstony', 'kch123', 'RN1', 'mintblade', 'fishalive', 'frostrizz', 'Len9311238', 'sparklingwater123', 'zxgngl', 'GRIMDRIP', '0xmaverick', 'pip_titan', 'goldenboy', 'vol_king', 'delta_dora', 'nattyG', 'mr_convex', 'satoshigrl']
export const HALL_CC = ['US', 'CH', 'GB', 'DE', 'NG', 'IN', 'SG', 'BR', 'AE', 'FR', 'AR', 'ZA', 'TR', 'VN', 'PH', 'ID', 'MX', 'EG', 'KE', 'PL']

export const avEmoji = (S, h) => (h === 'jstone' && S.me && S.me.emoji) ? S.me.emoji : AV_EMOJI[hdHash(h) % AV_EMOJI.length]

let _HALL = null
export function hallData() {
  if (_HALL) return _HALL
  const SLOTS = [['2026 World Series', 1, 3150000], ['2025 World Series', 1, 3150000], ['2024 World Series', 1, 3150000], ['2026 World Series', 2, 3150000], ['2025 World Series', 2, 3150000], ['Q3 Championship', 1, 842000], ['Q2 Championship', 1, 842000], ['Q1 Championship', 1, 842000], ['2026 World Series', 3, 3150000], ['2025 World Series', 3, 3150000], ['Q3 Championship', 2, 842000], ['Q2 Championship', 2, 842000], ['July Global Open', 1, 250000], ['June Global Open', 1, 250000], ['May Global Open', 1, 250000], ['April Global Open', 1, 250000], ['Q3 Championship', 3, 842000], ['July Global Open', 2, 250000], ['Weekly Open', 1, 62500], ['Daily Sprint', 1, 18400]]
  const out = SLOTS.map((sl, i) => { const payout = Math.round(sl[2] * PCT[sl[1] - 1] / 100); return { handle: HALL_USERS[i % HALL_USERS.length], country: HALL_CC[i % HALL_CC.length], stake: 25, payout, roi: payout / 25, pool: sl[2], place: sl[1], tour: sl[0] } })
  out.sort((a, b) => b.payout - a.payout); _HALL = out; return out
}
export function roiLabel(x) { const v = x >= 100 ? Math.round(x) : Math.round(x * 10) / 10; return v.toLocaleString() + '×' }
export function hallRow(h, i) {
  const ord = ['1st', '2nd', '3rd'][h.place - 1] || (h.place + 'th')
  return '<button class="hof-row" data-trader="' + h.handle + '"><span class="hof-rk">' + (i + 1) + '</span><span class="hof-av" style="background:' + avSeed(h.handle) + '"></span><span class="hof-main"><span class="hof-u">' + h.handle + ' <span class="hof-flag">' + flagEmoji(h.country) + '</span></span><span class="hof-mkt">' + h.tour + ' · ' + ord + ' · ' + fmt(h.pool) + ' pool</span></span><span class="hof-nums"><span class="hof-pay">' + fmt(h.stake) + ' <span class="hof-arrow">→</span> <b class="up">' + fmt(h.payout) + '</b></span><span class="hof-roi">' + roiLabel(h.roi) + ' return</span></span></button>'
}
export function hofHub() {
  const d = hallData()
  return '<div class="athead" style="margin-top:30px"><div class="ct">Hall of Fame</div><button class="thubsee" data-v="halloffame">See all ›</button></div><div class="hof hof-full"><div class="hof-sub" style="margin:0 0 4px">Biggest wins all-time — best returns ever made on Tradr, across every market. Tap anyone to see how they did it.</div><div class="hof-list">' + d.slice(0, 8).map(hallRow).join('') + '</div></div>'
}
export function allHof() { return hallData().map(hallRow).join('') }

export function hofTeaser() {
  const d = hallData().slice(0, 3)
  return '<div class="hofteaser"><div class="hofte-h"><span class="hofte-t"><svg viewBox="0 0 24 24" class="hofte-ic"><path d="M12 3l2.3 4.7 5.2.8-3.8 3.7.9 5.2L12 15.8 7.4 17.2l.9-5.2L4.5 8.3l5.2-.8L12 3z" fill="#f0a500"/></svg>Hall of Fame</span><button class="thubsee" data-v="halloffame">See all ›</button></div>' + d.map((h, i) => '<button class="hofte-row" data-trader="' + h.handle + '"><span class="hofte-rk">' + (i + 1) + '</span><span class="hofte-av" style="background:' + avSeed(h.handle) + '"></span><span class="hofte-nm">' + h.handle + ' <span class="hof-flag">' + flagEmoji(h.country) + '</span></span><span class="hofte-pay"><b class="up">' + fmt(h.payout) + '</b><span class="hofte-roi">' + roiLabel(h.roi) + '</span></span></button>').join('') + '</div>'
}

export function activeTourCard(S, k) {
  const t = S.tours[k], soon = S.tourSoon[k]
  const pool = (k === S.tourSel ? S.potShown : t.shown)
  const ms = Math.max(0, (k === S.tourSel ? S.closesAt : t.closesAt) - Date.now())
  const frac = Math.max(0, Math.min(1, ms / (TOUR_TOTAL[k] || 86400000))), col = cdColor(frac)
  return '<div class="atc' + (k === S.tourSel ? ' on' : '') + (soon ? ' soon' : '') + '" data-tour="' + k + '">' +
    '<div class="atc-top"><span class="atc-ic" style="background:' + cadTint(k) + '">' + cadIcon(k) + '</span><span class="atc-cad">' + t.cad + '</span>' + (soon ? '<span class="atc-soon">Soon</span>' : '<span class="atc-live"><span class="b"></span>Live</span>') + '</div>' +
    '<div class="atc-nm">' + t.name + '</div>' +
    '<div class="atc-pool tn">' + fmt(pool) + '</div>' +
    '<div class="atc-meta"><span>' + entrants(pool).toLocaleString() + ' in</span><span>·</span><span>£25 entry</span></div>' +
    (soon ? '<div class="atc-cd atc-soonline">Coming soon</div>' : '<div class="atc-cd">Closes in <span class="atc-cdv mono" style="color:' + col + '">' + fmtCountdown(ms) + '</span> · <span class="atc-go">view board ›</span></div>' + '<button class="atbtn" data-tourenter="' + k + '">Enter now</button>') +
    '</div>'
}

export function pastCard(p, i) {
  const st = (kk, vv) => '<div class="pst"><div class="pk">' + kk + '</div><div class="pv tn">' + vv + '</div></div>'
  return '<div class="pcard"><div class="phd" style="background:' + pheroTint(i) + '">' + pheroMark() + '<span class="loc"><svg viewBox="0 0 16 16"><path d="M8 14s5-4.5 5-8.5A5 5 0 0 0 3 5.5C3 9.5 8 14 8 14z"/><circle cx="8" cy="5.5" r="1.6"/></svg>' + p.city + '</span><span class="pdate">' + p.date + '</span></div>' +
    '<div class="pbody"><div class="pstats">' + st('Prize Pool', p.pool) + st('Entry Fee', p.entry) + st('Live Capital', p.cap) + '</div>' +
    '<div class="pended">Tournament ended</div>' +
    '<div class="pjoin"><span class="adot"></span>Traders joined: <b>' + p.joined + '</b></div></div></div>'
}
export { PAST }
