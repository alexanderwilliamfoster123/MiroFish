import React from 'react'
import { useStore } from '../store.jsx'
import { fmt, money, ordinal, fmtCountdown, cdColor } from '../engine/format.js'
import { tourField } from '../engine/sim.js'
import { plrow } from '../engine/builders.js'
import { hofTeaser } from '../engine/builders2.js'
import { cadTint, cadIcon } from '../engine/icons.js'
import { PCT, TOUR_TOTAL } from '../engine/data.js'
import Html from '../components/Html.jsx'
import DataScope from '../components/DataScope.jsx'

const entrants = (pool) => Math.round(pool / 25)

export default function LeaderboardView() {
  const { S, openBuy, set } = useStore()
  const field = tourField(S), per = 25
  const pages = Math.ceil(field.length / per)
  const page = Math.max(0, Math.min(S.lbPage, pages - 1))
  const slice = field.slice(page * per, page * per + per)
  const colL = slice.slice(0, 13), colR = slice.slice(13, 25)
  const TT = S.tours[S.tourSel]
  const closeFrac = Math.max(0, Math.min(1, (S.closesAt - Date.now()) / (TOUR_TOTAL[S.tourSel] || 30 * 86400000)))

  const rr = (k, v) => <div className="rr"><span className="k">{k}</span><span className="v">{v}</span></div>

  return (
    <DataScope className="lbpage">
      <div className="bc">Tournaments</div>
      <h1 className="lbtitle">{TT.name}</h1>
      <div className="tourtabs">
        {S.tourOrder.map((k) => {
          const t = S.tours[k], p = (k === S.tourSel ? S.potShown : t.shown)
          const soon = S.tourSoon[k]
          return (
            <button key={k} className={'ttab' + (k === S.tourSel ? ' on' : '') + (soon ? ' soon' : '')} data-tour={k}>
              <span className="tth"><Html tag="span" className="ttic" style={{ background: cadTint(k) }} html={cadIcon(k)} /><span className="tc">{t.cad}</span></span>
              {soon ? <span className="soonpill">Coming soon</span> : <><span className="tpp tn">{fmt(p)}</span><span className="te">£25 entry · {entrants(p).toLocaleString()} in</span></>}
            </button>
          )
        })}
      </div>
      <div className="lbgrid">
        <div className="lbleft">
          <div className="lbhero"><div className="lbhero-glow"></div>
            <div className="lbhero-pool tn">{money(S.potShown)}</div>
            <div className="lbhero-flash tn">{S.potFlash ? '+' + money(S.potFlash) : ''}</div>
            <div className="lbhero-sub">Prize pool · fed by <b>{entrants(S.potShown).toLocaleString()}</b> traders</div>
          </div>
          <div className="lbstatus"><span className="b"></span>Live · closes in <span className="mono" style={{ color: cdColor(closeFrac) }}>{fmtCountdown(Math.max(0, S.closesAt - Date.now()))}</span></div>
          <div className="lbbuy"><button className="btn pink full" onClick={openBuy}>Enter now</button><div className="buyhint">100% of every entry funds the pool · top 10 share it</div></div>
          <div className="card lbrules"><div className="lbrh">Tournament rules</div>
            {rr('Starting balance', '£100,000.00')}{rr('Entry fee', '£25')}<div className="lbrsec"></div>{rr('Start date', TT.sd)}{rr('End date', TT.ed)}
            <button className="btn full" onClick={() => set((s) => { s.rulesOpen = true })} style={{ marginTop: 14 }}>Read all rules</button>
          </div>
        </div>
        <div className="lbcenter">
          <div className="lbch"><span className="lbcount">{entrants(S.potShown).toLocaleString()} players</span>
            <div className="lbpag"><button className="pagb" data-lbpage="-1">‹</button><span>Players {page * per + 1}–{Math.min(field.length, page * per + per)}</span><button className="pagb" data-lbpage="1">›</button></div>
          </div>
          <div className="lbcols"><Html className="lbcol" html={colL.map((p) => plrow(S, p)).join('')} /><Html className="lbcol" html={colR.map((p) => plrow(S, p)).join('')} /></div>
        </div>
        <div className="lbright"><div className="lbrh2">Prize pool</div>
          <div className="podium">
            <div className="pod pod2"><div className="podrk">Rank #2</div><div className="podamt tn">{fmt(S.pot * PCT[1] / 100)}</div></div>
            <div className="pod pod1"><div className="podrk">Rank #1</div><div className="podamt tn">{fmt(S.pot * PCT[0] / 100)}</div></div>
            <div className="pod pod3"><div className="podrk">Rank #3</div><div className="podamt tn">{fmt(S.pot * PCT[2] / 100)}</div></div>
          </div>
          <div className="przlist">
            {[3, 4, 5, 6, 7, 8, 9].map((i) => <div className="przr" key={i}><span>{ordinal(i + 1)} Place</span><span className="tn">{money(S.pot * PCT[i] / 100)}</span></div>)}
          </div>
          <button className="btn full" data-toast="Event details — coming soon">Event details</button>
          <Html html={hofTeaser()} />
        </div>
      </div>
    </DataScope>
  )
}
