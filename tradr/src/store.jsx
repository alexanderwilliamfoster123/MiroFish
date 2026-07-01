import React, { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react'
import { makeInstruments, makeTours, makeAffil, TOUR_ORDER, BOT_SEED, TITLES } from './engine/data.js'
import * as sim from './engine/sim.js'

const StoreCtx = createContext(null)
export const useStore = () => useContext(StoreCtx)

// Build the initial mutable state object (mirrors the prototype's global `S`).
function makeInitialState() {
  const instr = makeInstruments()
  const syms = Object.keys(instr)
  const hist = {}; syms.forEach((s) => { hist[s] = [instr[s].price] })
  const bots = BOT_SEED.map((b) => ({ handle: b[0], country: b[1], ret: b[2], dd: 4 + Math.random() * 16, prevRank: 0, hist: [b[2]] }))
  const tours = makeTours()

  const S = {
    view: 'tournament', appMode: 'trader',
    instr, syms, hist, bots,
    accounts: [], activeId: null, _accSeq: 0,
    sel: 'XAU/USD', ticket: { side: 'long' },
    myPrevRank: 0, newOpen: false,
    buyOpen: false, buyStep: 1, buyCad: 'Daily', buyQty: 1, pay: 'card',
    wins: 18200, liveCap: 1180000, spots: 25,
    perfAcc: 'all', perfView: 'overview', perfUnit: 'pct', perfRange: 'max', perfMenu: false,
    lbPage: 0, chat: [], liveTraders: 9830, youHist: [0],
    pot: 250000, potShown: 250000, potPpl: 1240, potYear: 418200, potFlash: 0, bankedWon: 266900,
    mile: sim.computeMile(250000),
    tourSel: 'monthly', tours, tourOrder: TOUR_ORDER, tourSoon: {}, tourRemind: {}, tourTab: 'live',
    affil: makeAffil(),
    notifOpen: false, notifUnread: 2,
    notifs: [
      { ic: '£', cls: 'comm', title: 'Monthly summary · June', sub: '£1,760 earned · paid 1 Jul', ago: '1d' },
      { ic: '£', cls: 'comm', title: 'Weekly summary', sub: '£420 from 9 purchases', ago: '2d' },
      { ic: '★', cls: 'win', title: 'Player won £1,114', sub: 'ro****pl cashed the Quarterly', ago: '5h' },
      { ic: '+', cls: 'signup', title: 'New signup', sub: 'da****19 joined via your link', ago: '6h' }
    ],
    closesAt: tours.monthly.closesAt,
    // feed / social
    feedFilter: 'all', feedPosts: [], feedLikes: {}, feedRT: {}, following: {}, me: { thoughts: [] },
    trTab: 'posts',
    // ideas
    ideaCat: 'All', ideaHz: 'all', ideaFeed: [], ideaMode: 'board', catalysts: [], catSeq: 0, algos: {}, algoSel: {},
    // terminal
    term: {
      acct: null, mode: 'day', asset: 'XAU/USD', risk: 1, rr: 2, pos: null, streak: 0, hist: [], bal: 100000,
      spark: [], candles: {}, tf: '5m', cross: null, _bt: 0, acctMenu: false, inds: {},
      order: { type: 'market', side: 'up', entry: null, sl: null, tp: null, t: { entry: false, sl: false, tp: false } }, ui: 'simple'
    },
    positions: [], history: [], orders: [], posSeq: 0,
    // toast
    toast: '', _toastId: 0
  }

  S.accounts = [sim.makeAccount(S, 'Monthly', 8200), sim.makeAccount(S, 'Daily', -1450), sim.makeAccount(S, 'Quarterly', 21300)]
  sim.seedAccount(S, S.accounts[0], 8200, 26)
  sim.seedAccount(S, S.accounts[1], -1450, 14)
  sim.seedAccount(S, S.accounts[2], 21300, 32)
  S.activeId = S.accounts[0].id
  S.perfAcc = S.accounts[0].id
  S.term.acct = S.accounts[0].id
  return S
}

export function StoreProvider({ children }) {
  const ref = useRef(null)
  if (ref.current === null) ref.current = makeInitialState()
  const S = ref.current
  const [, setV] = useState(0)
  const force = useCallback(() => setV((n) => (n + 1) & 0x7fffffff), [])

  // toast helper
  const toast = useCallback((m) => {
    S.toast = m; S._toastId++
    force()
  }, [S, force])

  // ---- simulation loop ----
  useEffect(() => {
    const t1 = setInterval(() => { sim.tick(S); force() }, 1100)
    const t2 = setInterval(() => { force() }, 1000) // countdowns
    return () => { clearInterval(t1); clearInterval(t2) }
  }, [S, force])

  // ---- actions ----
  const navigate = useCallback((v) => {
    S.view = v
    S.appMode = (v === 'affiliate') ? 'partner' : 'trader'
    S.notifOpen = false
    force()
    try { window.scrollTo(0, 0) } catch (e) { /* ignore */ }
  }, [S, force])

  const setTheme = useCallback((t) => {
    document.documentElement.setAttribute('data-theme', t)
    try { localStorage.setItem('tradrTheme', t) } catch (e) { /* ignore */ }
    force()
  }, [force])

  const toggleTheme = useCallback(() => {
    setTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light')
  }, [setTheme])

  const setMode = useCallback((mode) => { navigate(mode === 'partner' ? 'affiliate' : 'tournament') }, [navigate])

  const toggleNotif = useCallback(() => {
    S.notifOpen = !S.notifOpen
    if (S.notifOpen) S.notifUnread = 0
    force()
  }, [S, force])
  const clearNotif = useCallback(() => { S.notifUnread = 0; force() }, [S, force])

  // generic state setter for view-local toggles
  const set = useCallback((mut) => { mut(S); force() }, [S, force])

  // ---- tournament / accounts ----
  const setActive = useCallback((id) => { if (S.accounts.some((a) => a.id === id)) S.activeId = id; force() }, [S, force])
  const tourSwitch = useCallback((id) => { sim.tourSwitch(S, id); force() }, [S, force])
  const openBuy = useCallback(() => { S.buyOpen = true; S.buyStep = 1; S.buyQty = 1; S.pay = 'card'; force() }, [S, force])
  const closeBuy = useCallback(() => { S.buyOpen = false; force() }, [S, force])
  const setBuyQty = useCallback((d) => { S.buyQty = Math.max(1, Math.min(20, S.buyQty + d)); force() }, [S, force])
  const buyNext = useCallback(() => { S.buyStep = 2; force() }, [S, force])
  const buyBack = useCallback(() => { S.buyStep = 1; force() }, [S, force])
  const setPay = useCallback((p) => { S.pay = p; force() }, [S, force])
  const buyPay = useCallback(() => {
    S.buyStep = 3; force()
    setTimeout(() => {
      const cad = S.tours[S.tourSel] ? S.tours[S.tourSel].cad : 'Monthly'
      let last
      for (let i = 0; i < S.buyQty; i++) { const na = sim.makeAccount(S, cad, 0); S.accounts.push(na); last = na.id }
      S.activeId = last; S.perfAcc = last
      const add = S.buyQty * 25; S.pot += add; S.potShown += add; S.potPpl = Math.round(S.pot / 25)
      S.buyStep = 4; force()
    }, 1500)
  }, [S, force])
  const buyDone = useCallback(() => { S.buyOpen = false; force(); navigate('leaderboard') }, [S, force, navigate])

  // Bridge for prototype-style data-attribute interactions inside ported HTML chunks.
  const handleData = useCallback((el) => {
    if (!el) return false
    const d = el.dataset
    if (d.href) { window.open(d.href, '_blank'); return true }
    if (d.v) { navigate(d.v); return true }
    if (d.go) { navigate(d.go); return true }
    if ('buyopen' in d || 'join' in d) { openBuy(); return true }
    if ('rules' in d) { S.rulesOpen = true; force(); return true }
    if (d.toast != null) { toast(d.toast); return true }
    if (d.tourenter) { tourSwitch(d.tourenter); openBuy(); return true }
    if (d.tour) { tourSwitch(d.tour); navigate('leaderboard'); return true }
    if (d.lbpage) { S.lbPage = Math.max(0, S.lbPage + parseInt(d.lbpage, 10)); force(); return true }
    if (d.tourtab) { S.tourTab = d.tourtab; force(); try { window.scrollTo(0, 0) } catch (e) {} return true }
    if (d.tradeAcc) { setActive(d.tradeAcc); S.perfAcc = d.tradeAcc; navigate('performance'); toast('Viewing ' + d.tradeAcc); return true }
    if (d.acc) { setActive(d.acc); navigate('tournament'); return true }
    if (d.trader) {
      const th = d.trader
      if (th === 'jstone') { S.traderId = 'jstone'; if (S.view !== 'trader') S.traderFrom = S.view; navigate('trader'); return true }
      if (S.view === 'tournament') { S.acctId = th; S.acctFrom = 'tournament'; navigate('account'); return true }
      S.traderId = th; if (S.view !== 'trader') S.traderFrom = S.view; navigate('trader'); return true
    }
    if ('compinvite' in d) { toast('Invites — open the Invites tab to send competition invites'); return true }
    return false
  }, [S, force, navigate, openBuy, toast, tourSwitch, setActive])

  const value = {
    S, force, toast, navigate, setTheme, toggleTheme, setMode, toggleNotif, clearNotif, set, sim,
    setActive, tourSwitch, openBuy, closeBuy, setBuyQty, buyNext, buyBack, setPay, buyPay, buyDone, handleData
  }
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}
