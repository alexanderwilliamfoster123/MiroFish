import React from 'react'
import { useStore } from '../store.jsx'
import { fmt, money } from '../engine/format.js'
import { bestRank, prizeFor, active } from '../engine/sim.js'
import { TITLES } from '../engine/data.js'

export default function TopBar() {
  const { S, toggleTheme, setMode, toggleNotif } = useStore()
  const a = active(S)
  const aw = prizeFor(S, bestRank(S))
  const partner = S.appMode === 'partner'
  const sub = S.accounts.length + ' accounts · active ' + (a ? a.id : '—') + (a ? ' (' + a.cadence + ')' : '')
  return (
    <div className="top">
      <div className="h">{TITLES[S.view] || 'Home'}</div>
      <div className="sub">{sub}</div>
      <div className="sp"></div>
      <span className="chip">Total winnings <b className="tn">{fmt((S.bankedWon || 0) + aw)}</b></span>
      <span className="chip">Active winnings <b className="tn">{fmt(aw)}</b></span>
      <button className="themeb" onClick={toggleTheme} aria-label="Toggle light/dark">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="8.5" /><path d="M12 3.5a8.5 8.5 0 0 0 0 17z" fill="currentColor" stroke="none" /></svg>
      </button>
      <div className="modetog">
        <button className={'modeb' + (!partner ? ' on' : '')} onClick={() => setMode('trader')}>Trader</button>
        <button className={'modeb' + (partner ? ' on' : '')} onClick={() => setMode('partner')}>Partner</button>
      </div>
      <span className="chip partnerchip" style={{ display: partner ? 'inline-flex' : 'none' }}>Today <b className="tn">{money(S.affil.today || 0)}</b></span>
      <button className="bell" onClick={toggleNotif} aria-label="Notifications">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M6 9.5a6 6 0 0 1 12 0c0 4.5 2 5.5 2 5.5H4s2-1 2-5.5" strokeLinejoin="round" /><path d="M10 19a2 2 0 0 0 4 0" fill="currentColor" stroke="none" /></svg>
        {S.notifUnread > 0 && <span className="bell-dot"></span>}
      </button>
      <div className="av">JS</div>
    </div>
  )
}
