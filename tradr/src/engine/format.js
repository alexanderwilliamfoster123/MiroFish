// Pure formatting + small helpers, ported verbatim from the prototype.

export const LT = () => document.documentElement.getAttribute('data-theme') === 'light'

export function fmt(n) {
  const a = Math.abs(n), s = n < 0 ? '-' : ''
  if (a >= 1e9) return s + '£' + (a / 1e9).toFixed(2) + 'B'
  if (a >= 1e6) return s + '£' + (a / 1e6).toFixed(2) + 'M'
  if (a >= 1e3) return s + '£' + (a / 1e3).toFixed(1) + 'K'
  return s + '£' + Math.round(a).toLocaleString()
}
export const money = (n) => (n < 0 ? '-£' : '£') + Math.abs(Math.round(n)).toLocaleString()
export const entrants = (pool) => Math.round(pool / 25) // pool = entries x £25 (100% to pool)
export const gbp2 = (n) => '£' + Number(n).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const pxv = (p) => p < 10 ? p.toFixed(4) : p < 1000 ? p.toFixed(2) : Math.round(p).toLocaleString()
export const pct = (n) => (n >= 0 ? '+' : '') + n.toFixed(2) + '%'
export const kfmt = (n) => n >= 1000 ? (n / 1000).toFixed(1).replace('.0', '') + 'K' : '' + n

export function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

export function flagEmoji(cc) {
  if (!cc) return ''
  return String(cc).toUpperCase().replace(/[A-Z]/g, (ch) => String.fromCodePoint(127397 + ch.charCodeAt(0)))
}

export function tago(ts) {
  const s = (Date.now() - ts) / 1000
  if (s < 60) return Math.floor(s) + 's'
  if (s < 3600) return Math.floor(s / 60) + 'm'
  if (s < 86400) return Math.floor(s / 3600) + 'h'
  return Math.floor(s / 86400) + 'd'
}

export function avSeed(name) {
  const pal = ['linear-gradient(145deg,#7c8cff,#5566e0)', 'linear-gradient(145deg,#34d399,#10b981)', 'linear-gradient(145deg,#ffb35c,#f59e0b)', 'linear-gradient(145deg,#ff7eb3,#ff4d94)', 'linear-gradient(145deg,#9a7cff,#7c5cff)', 'linear-gradient(145deg,#5bc8ff,#2f9bff)', 'linear-gradient(145deg,#f0998f,#e0675a)', 'linear-gradient(145deg,#8fd9b6,#4fb98a)']
  let h = 0; const n = String(name)
  for (let i = 0; i < n.length; i++) h = (h * 31 + n.charCodeAt(i)) >>> 0
  return pal[h % pal.length]
}

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;')
export const escHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export function hashFor(seed) {
  seed = String(seed); let s = 2166136261
  for (let i = 0; i < seed.length; i++) { s ^= seed.charCodeAt(i); s = (s * 16777619) >>> 0 }
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789'; let o = ''
  for (let j = 0; j < 32; j++) { s = (s * 1103515245 + 12345) >>> 0; o += A[s % A.length] }
  return o
}

export function fmtCountdown(ms) {
  ms = Math.max(0, ms)
  const d = Math.floor(ms / 86400000), h = Math.floor(ms / 3600000) % 24, m = Math.floor(ms / 60000) % 60, sc = Math.floor(ms / 1000) % 60
  const p = (n) => String(n).padStart(2, '0')
  return (d > 0 ? d + 'd ' : '') + p(h) + 'h ' + p(m) + 'm ' + p(sc) + 's'
}
export const cdColor = (frac) => frac > 0.5 ? '#16a878' : frac > 0.2 ? '#f5a524' : '#e5484d'

// Tiny inline sparkline as an SVG string.
export function spark(hist) {
  if (!hist || hist.length < 2) hist = [0, 0]
  const min = Math.min.apply(null, hist), max = Math.max.apply(null, hist), rng = (max - min) || 1, n = hist.length, W = 66, H = 18
  const pts = hist.map((v, i) => (i / (n - 1) * W).toFixed(1) + ',' + (H - ((v - min) / rng) * (H - 4) - 2).toFixed(1)).join(' ')
  const up = hist[hist.length - 1] >= hist[0]
  return '<svg class="spk" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '"><polyline points="' + pts + '" fill="none" stroke="' + (up ? '#7fb39a' : '#c98a8a') + '" stroke-width="1.3" stroke-linejoin="round"/></svg>'
}
