// Core static data + constants, ported verbatim from the prototype.
export { IDEAS, ALGOS, CAT_ORDER, CATNAME, CATSRC, HZLBL, CATTPL, CAT_TTL } from './_bigdata.js'
export { makeAffil } from './_affil.js'

export const TICK = 1100
export const START = 100000
export const NOTIONAL = 12000
export const START_BAL = 100000
export const POOL = 250000
export const PCT = [40, 20, 10, 7, 6, 5, 4, 3.5, 3, 1.5]
export const ORD = ['1st', '2nd', '3rd', '4th', '5th']
export const ORD3 = ['1ST', '2ND', '3RD']

export const CAD = {
  Daily: { entry: 25, pool: '£18.4K' }, Weekly: { entry: 25, pool: '£62.5K' }, Monthly: { entry: 25, pool: '£257K' },
  Quarterly: { entry: 25, pool: '£842K' }, Annual: { entry: 25, pool: '£3.15M' }
}
export const CADK = Object.keys(CAD)

export const PAST = [
  { city: 'London', pool: '£50K', entry: 'Free', cap: '£179K', joined: 358, date: 'Mar 2026' },
  { city: 'Rome', pool: '£50K', entry: 'Free', cap: '£104K', joined: 208, date: 'Feb 2026' },
  { city: 'Amsterdam', pool: '£25K', entry: 'Free', cap: '£78K', joined: 156, date: 'Feb 2026' },
  { city: 'Dubai', pool: '£100K', entry: '£50', cap: '£420K', joined: 612, date: 'Jan 2026' },
  { city: 'Singapore', pool: '£75K', entry: '£25', cap: '£311K', joined: 489, date: 'Dec 2025' },
  { city: 'New York', pool: '£120K', entry: '£50', cap: '£503K', joined: 742, date: 'Nov 2025' }
]

// Instruments. price/open mutate at runtime, so this is a factory.
export function makeInstruments() {
  return {
    'XAU/USD': { name: 'Gold', price: 2418.5, vol: 0.0011, open: 2418.5 },
    'BTC/USD': { name: 'Bitcoin', price: 63240, vol: 0.0020, open: 63240 },
    'EUR/USD': { name: 'Euro', price: 1.0902, vol: 0.0005, open: 1.0902 },
    'US100': { name: 'Nasdaq 100', price: 19840, vol: 0.0012, open: 19840 }
  }
}

// Leaderboard bot seed (handle, country, base return %).
export const BOT_SEED = [
  ['kaito_v', 'SG', 46], ['amaka.fx', 'NG', 38], ['delta_one', 'AE', 33], ['rohan.p', 'IN', 29],
  ['tariq.z', 'EG', 24], ['viet.nguyen', 'VN', 19], ['lina_m', 'BR', 14], ['m_kowalski', 'PL', 9],
  ['chloe.s', 'FR', 4], ['suarez.j', 'MX', -2], ['okafor', 'NG', -7], ['danes', 'GB', -13]
]

export const TCOUNTRY = ['NG', 'IN', 'SG', 'AE', 'EG', 'VN', 'BR', 'PL', 'FR', 'MX', 'GB', 'ID', 'PH', 'ZA', 'TR', 'PK', 'KE', 'MY', 'TH', 'DE', 'ES', 'IT', 'CO', 'AR', 'US', 'CA', 'KR', 'SA', 'GH', 'UA']
export const TNAMES = ['Rudy', 'Dion Trades', 'Sander Schouten', 'Linnea Karlsson', 'Omar Mansour', 'Imani', 'NightOwlFX', 'Bjorn', 'Marcus Reinholt', 'Amara Diallo', 'Esmé Lambert', 'Elena Voss', 'Sven Lindgren', 'Callum Reid', 'Dax', 'Rune', 'Naomi Fischer', 'Matteo Esposito', 'Connor Whitfield', 'Zara Mahmood', 'Levi', 'Jasper', 'Kaito', 'amaka.fx', 'Tariq Z', 'Viet Nguyen', 'Lina Moreau', 'Chloe S', 'Mateo Rossi', 'Yuki', 'Nadia Khan', 'Diego Costa', 'Sofia Silva', 'Liam', 'Aisha Haddad', 'Noah', 'Mei', 'Hassan', 'Olga Petrov', 'Pavel Novak', 'Ingrid', 'Tomas', 'Kofi Okafor', 'Ravi']
export const TFN = ['Aria', 'Jonas', 'Mila', 'Theo', 'Sena', 'Idris', 'Greta', 'Bram', 'Yusuf', 'Cora', 'Niko', 'Faye', 'Otto', 'Vera', 'Zane', 'Wassim', 'Yara', 'Dmitri', 'Elif', 'Hugo', 'Nina', 'Erik', 'Lucia', 'Sara', 'Pia', 'Arlo', 'Remy', 'Tariq', 'Sol', 'Bea']
export const THAND = ['FX', '_v', '.p', 'Trades', '24', '.io', '_fx', 'Capital', 'Trades', 'x']

export const ICATS = ['All', 'Technical', 'Event', 'Sentiment', 'Quant', 'Catalyst', 'Intermarket']
export const LENSC = { Technical: '#5b8bff', Event: '#f59e0b', Sentiment: '#9a7cff', Quant: '#10b981', Catalyst: '#e5484d', Intermarket: '#2f9bff', Fun: '#ff2e88' }

// Tournament configuration. Factory: closesAt uses fresh timestamps per session.
export function makeTours() {
  const now = Date.now()
  return {
    daily: { name: 'Daily Sprint', cad: 'Daily', pool: 18400, shown: 18400, ppl: 214, year: 31200, seed: 3001, scale: 0.18, sd: 'Today · 00:00', ed: 'Today · 23:59', closesAt: now + (13 * 3600 + 2400) * 1000, bots: null, mile: null },
    weekly: { name: 'Weekly Open', cad: 'Weekly', pool: 62500, shown: 62500, ppl: 548, year: 96000, seed: 7013, scale: 0.42, sd: 'Jun 23 · 00:00', ed: 'Jun 29 · 23:59', closesAt: now + (2 * 86400 + 4000) * 1000, bots: null, mile: null },
    monthly: { name: 'July Global Open', cad: 'Monthly', pool: 250000, shown: 250000, ppl: 1240, year: 418200, seed: 20260622, scale: 1, sd: 'Jun 22 · 00:00', ed: 'Jul 17 · 00:00', closesAt: now + (4 * 86400 + 8120) * 1000, bots: null, mile: null },
    quarterly: { name: 'Q3 Championship', cad: 'Quarterly', pool: 842000, shown: 842000, ppl: 3980, year: 1180000, seed: 9044, scale: 1.8, sd: 'Jul 1 · 00:00', ed: 'Sep 30 · 23:59', closesAt: now + (62 * 86400) * 1000, bots: null, mile: null },
    yearly: { name: '2026 World Series', cad: 'Yearly', pool: 3150000, shown: 3150000, ppl: 12640, year: 3150000, seed: 5077, scale: 3.2, sd: 'Jan 1 · 00:00', ed: 'Dec 31 · 23:59', closesAt: now + (187 * 86400) * 1000, bots: null, mile: null }
  }
}
export const TOUR_ORDER = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly']
export const TOUR_TOTAL = { daily: 24 * 3600000, weekly: 7 * 86400000, monthly: 30 * 86400000, quarterly: 92 * 86400000, yearly: 365 * 86400000 }

export const TITLES = { home: 'Home', feed: 'Feed', assistant: 'Assistant', leaderboard: 'Tournaments', tournament: 'Tournaments', arena: 'Arena', ideas: 'Trade Ideas', terminal: 'Trade', trade: 'Trade', performance: 'Performance', profile: 'Profile', trader: 'Trader', account: 'Account', halloffame: 'Hall of Fame', affiliate: 'Affiliate', invites: 'Invites' }
