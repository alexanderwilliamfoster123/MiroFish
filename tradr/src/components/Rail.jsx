import React from 'react'
import { useStore } from '../store.jsx'
import { bestRank } from '../engine/sim.js'
import Html from './Html.jsx'

const traderNav = [
  { v: 'tournament', label: 'Tournaments', bg: 'linear-gradient(145deg,#ffc24b,#f59e0b)', svg: '<svg viewBox="0 0 24 24"><path d="M7 4h10v4a5 5 0 0 1-10 0z" fill="none" stroke="#fff" stroke-width="1.7"/><path d="M12 13v4M9 19h6" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/><path d="M5 5H3.2v1.4A3 3 0 0 0 6 9.4M19 5h1.8v1.4A3 3 0 0 1 18 9.4" fill="none" stroke="#fff" stroke-width="1.5"/></svg>' },
  { v: 'feed', label: 'Feed', bg: 'linear-gradient(145deg,#7c5cff,#a78bfa)', svg: '<svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h10" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>' },
  { v: 'invites', label: 'Invites', bg: 'linear-gradient(145deg,#ff7eb3,#ff5c8a)', svg: '<svg viewBox="0 0 24 24"><rect x="4" y="6.5" width="16" height="11" rx="2" fill="none" stroke="#fff" stroke-width="1.7"/><path d="M4.5 8l7.5 5 7.5-5" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
  { v: 'terminal', label: 'Trade', bg: 'linear-gradient(145deg,#34d399,#10b981)', svg: '<svg viewBox="0 0 24 24"><rect x="3" y="4.5" width="18" height="15" rx="2.4" fill="none" stroke="#fff" stroke-width="1.7"/><path d="M7 9l3 2.4-3 2.4" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><line x1="12.5" y1="14.5" x2="17" y2="14.5" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/></svg>' },
  { v: 'performance', label: 'Performance', bg: 'linear-gradient(145deg,#5b8bff,#2f6bff)', svg: '<svg viewBox="0 0 24 24"><path d="M4 16.5l4.5-4.5 3 2.5L20 6" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 6h5v5" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' }
]

const partnerNav = [
  { tab: 'overview', label: 'Dashboard', bg: 'linear-gradient(145deg,#9a7cff,#7c5cff)', svg: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="8" height="8" rx="1.5" fill="#fff"/><rect x="13" y="3" width="8" height="8" rx="1.5" fill="#fff"/><rect x="3" y="13" width="8" height="8" rx="1.5" fill="#fff"/><rect x="13" y="13" width="8" height="8" rx="1.5" fill="#fff"/></svg>' },
  { tab: 'network', label: 'Network', bg: 'linear-gradient(145deg,#5bd0a0,#16a878)', svg: '<svg viewBox="0 0 24 24"><circle cx="7" cy="7" r="2.6" fill="none" stroke="#fff" stroke-width="1.7"/><circle cx="17" cy="7" r="2.6" fill="none" stroke="#fff" stroke-width="1.7"/><path d="M7 9.6v3.4M17 9.6v3.4M7 13h10" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/><circle cx="12" cy="18.5" r="2.6" fill="none" stroke="#fff" stroke-width="1.7"/><path d="M12 13v2.9" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/></svg>' },
  { tab: 'clients', label: 'Clients', bg: 'linear-gradient(145deg,#5b8bff,#2f6bff)', svg: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8.5" r="3.2" fill="none" stroke="#fff" stroke-width="1.7"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/><path d="M16 6.5a3 3 0 0 1 0 6M17 19a5 5 0 0 0-3-4.6" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></svg>' },
  { tab: 'earnings', label: 'Earnings', bg: 'linear-gradient(145deg,#ffc24b,#f59e0b)', svg: '<svg viewBox="0 0 24 24"><path d="M4 16.5l4.5-4.5 3 2.5L20 6" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 6h5v5" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
  { tab: 'assets', label: 'Assets', bg: 'linear-gradient(145deg,#ff7eb3,#ff2e88)', svg: '<svg viewBox="0 0 24 24"><rect x="3.5" y="4.5" width="17" height="15" rx="2.2" fill="none" stroke="#fff" stroke-width="1.7"/><circle cx="8.5" cy="9.5" r="1.6" fill="#fff"/><path d="M4 17l4.5-4 3 2.4 4-3.4 4.5 4" fill="none" stroke="#fff" stroke-width="1.7" stroke-linejoin="round"/></svg>' }
]

export default function Rail() {
  const { S, navigate, set } = useStore()
  const partner = S.appMode === 'partner'
  return (
    <aside className="rail">
      <div className="brand"><div className="mk"></div><div className="wm">TRADR</div></div>

      <nav className="nav" id="nav" style={{ display: partner ? 'none' : '' }}>
        {traderNav.map((n) => (
          <button key={n.v} className={S.view === n.v ? 'on' : ''} onClick={() => navigate(n.v)}>
            <Html className="nic" style={{ background: n.bg }} html={n.svg} />
            {n.label}
          </button>
        ))}
      </nav>

      <nav className="nav" id="navPartner" style={{ display: partner ? '' : 'none' }}>
        <div className="prail-h">Partner portal</div>
        {partnerNav.map((n) => (
          <button key={n.tab} className={(S.affil.tab || 'overview') === n.tab ? 'on' : ''}
            onClick={() => { set((s) => { s.affil.tab = n.tab }); navigate('affiliate') }}>
            <Html className="nic" style={{ background: n.bg }} html={n.svg} />
            {n.label}
          </button>
        ))}
      </nav>

      <div className="foot"><div className="rg">Best rank</div><div className="rk tn">#{bestRank(S)}</div></div>
      <button className="railprof" onClick={() => { S.traderId = 'jstone'; if (S.view !== 'trader') S.traderFrom = S.view; navigate('trader') }}>
        <Html className="nic" style={{ background: 'linear-gradient(145deg,#ff7eb3,#ff2e88)' }}
          html='<svg viewBox="0 0 24 24"><circle cx="12" cy="8.5" r="3.6" fill="none" stroke="#fff" stroke-width="1.7"/><path d="M5.5 19a6.5 6.5 0 0 1 13 0" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/></svg>' />
        Profile
      </button>
    </aside>
  )
}
