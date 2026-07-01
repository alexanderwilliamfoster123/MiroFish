import React, { useRef } from 'react'
import { useStore } from '../store.jsx'
import { fmt, money, avSeed, fmtCountdown, cdColor } from '../engine/format.js'
import { tourField } from '../engine/sim.js'
import { miniLb } from '../engine/builders.js'
import { activeTourCard, hofHub, pastCard, avEmoji, PAST } from '../engine/builders2.js'
import { TOUR_TOTAL } from '../engine/data.js'
import Html from '../components/Html.jsx'
import DataScope from '../components/DataScope.jsx'

const entrants = (pool) => Math.round(pool / 25)
const SWORDS = '<svg viewBox="0 0 24 24" class="swd"><path d="M6 3l8.5 8.5-2.5 2.5L3.5 5.5 4 3z" fill="currentColor"/><path d="M18 3l-8.5 8.5 2.5 2.5L20 5.5 20 3z" fill="currentColor"/><path d="M3.5 17.5l3 3M20.5 17.5l-3 3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>'

export default function TournamentView() {
  const { S, set, navigate, openBuy } = useStore()
  const carRef = useRef(null)

  const subTabs = (
    <div className="tsub">
      <button className={'tsub-b' + (S.tourTab === 'arena' ? '' : ' on')} onClick={() => set((s) => { s.tourTab = 'comps' })}>Tournaments</button>
      <button className={'tsub-b' + (S.tourTab === 'arena' ? ' on' : '')} onClick={() => set((s) => { s.tourTab = 'arena' })}><Html tag="span" html={SWORDS} /> Arena</button>
    </div>
  )

  if (S.tourTab === 'arena') {
    return (<div>{subTabs}
      <div className="card" style={{ padding: 28, marginTop: 16 }}>
        <div className="tkick"><span className="b"></span>Live now</div>
        <h1 className="ttitle" style={{ marginTop: 10 }}>The Arena</h1>
        <p className="tdesc">Head-to-head trade-offs — challenge anyone, pick the window and the higher return takes the escrowed pot. The full Arena (PvP battles, escrow, live spectating) is part of the prototype’s deep surface and isn’t wired into this first React port yet.</p>
        <button className="btn pink" onClick={() => set((s) => { s.tourTab = 'comps' })}>Back to tournaments</button>
      </div>
    </div>)
  }

  const field = tourField(S)
  let totalPool = 0, totalPlayers = 0
  Object.keys(S.tours).forEach((k) => { const pv = (k === S.tourSel ? S.potShown : S.tours[k].shown); totalPool += pv; totalPlayers += entrants(pv) })
  const totalCap = totalPlayers * 100000
  const ms = Math.max(0, S.closesAt - Date.now())

  return (
    <DataScope>
      {subTabs}
      <div className="thero">
        <div className="theroL">
          <div className="tkick"><span className="b"></span>Live</div>
          <h1 className="ttitle">Live tournaments</h1>
          <p className="tdesc">Every entry adds 100% to its prize pool and the top 10 on each board share it. Open to everyone — buy in any time, no spot limit.</p>
          <div className="tstats">
            <div className="tstat"><div className="k">Total prize pool</div><div className="v tn">{fmt(totalPool)}</div></div>
            <div className="tstat"><div className="k">Active players</div><div className="v tn">{totalPlayers.toLocaleString()}</div></div>
            <div className="tstat"><div className="k">Live capital</div><div className="v tn">{fmt(totalCap)}</div></div>
          </div>
          <div className="tcta"><button className="btn lg pink" onClick={openBuy}>Enter now</button></div>
          <div className="tjoin">
            <div className="tjoin-avs">{['Theo4', 'swisstony', 'mintblade', '0xmaverick'].map((u) => (
              <Html key={u} tag="span" className="tjoin-av" data-trader={u} style={{ background: avSeed(u) }} html={avEmoji(S, u)} />
            ))}</div>
            <span className="tjoin-txt"><b>@Theo4</b>, <b>@swisstony</b> &amp; <b>12.6K</b> others competing — tap to scout them</span>
          </div>
          <div className="tinvwrap"><button className="tinvite" onClick={() => navigate('invites')}>Invite friends to compete →</button></div>
          <div className="tmeta"><div className="tspots"><span className="adot"></span>Open to all · no spot limit</div><div className="tspots"><span className="cdk">Next close</span> <b>{fmtCountdown(ms)}</b></div></div>
        </div>
        <div className="theroR"><div className="llb"><div className="llbh"><span>Live leaderboard</span><span className="pill"><span className="dot"></span>Live</span></div>
          <Html html={miniLb(field)} />
          <button className="llbview" onClick={() => navigate('leaderboard')}>View leaderboard<svg viewBox="0 0 16 16"><path d="M6 3l5 5-5 5" /></svg></button>
        </div></div>
      </div>

      <div className="athead"><div className="ct">Active tournaments</div><span className="atsub">{S.tourOrder.length} running · tap to view the board</span></div>
      <Html className="atgrid" html={S.tourOrder.map((k) => activeTourCard(S, k)).join('')} />

      <Html html={hofHub()} />

      <div className="carwrap">
        <div className="carhead"><div className="ct">Past tournaments</div>
          <div className="carbtns">
            <button className="carbtn" onClick={() => carRef.current && carRef.current.scrollBy({ left: -346, behavior: 'smooth' })}><svg viewBox="0 0 16 16"><path d="M10 3l-5 5 5 5" /></svg></button>
            <button className="carbtn" onClick={() => carRef.current && carRef.current.scrollBy({ left: 346, behavior: 'smooth' })}><svg viewBox="0 0 16 16"><path d="M6 3l5 5-5 5" /></svg></button>
          </div>
        </div>
        <div className="carousel" ref={carRef} dangerouslySetInnerHTML={{ __html: PAST.map(pastCard).join('') }} />
      </div>
    </DataScope>
  )
}
