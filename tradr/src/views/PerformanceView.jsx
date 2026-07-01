import React, { useEffect, useRef } from 'react'
import { useStore } from '../store.jsx'
import { fmt, money, pct, hashFor } from '../engine/format.js'
import { pstatIcon } from '../engine/icons.js'
import * as P from '../engine/perf.js'
import Html from '../components/Html.jsx'
import DataScope from '../components/DataScope.jsx'

export default function PerformanceView() {
  const { S } = useStore()
  const rootRef = useRef(null)

  const single = S.perfAcc !== 'all'
  const set = P.perfSet(S)
  const acctName = single ? S.perfAcc : 'All tournaments'
  const start = P.perfStart(set), bal = P.perfBalance(set), eq = P.perfEquity(S, set), net = P.perfNet(S, set)
  const ret = start ? (eq - start) / start * 100 : 0, dd = P.perfDD(set)
  const tr = P.perfTradesAll(set), winsArr = tr.filter((t) => t.pnl > 0), lossArr = tr.filter((t) => t.pnl < 0)
  const wins = winsArr.length, losses = lossArr.length, wr = (wins + losses) ? wins / (wins + losses) * 100 : 0
  const avgW = wins ? winsArr.reduce((s, t) => s + t.pnl, 0) / wins : 0, avgL = losses ? Math.abs(lossArr.reduce((s, t) => s + t.pnl, 0) / losses) : 0
  const mean = tr.length ? tr.reduce((s, t) => s + t.pnl, 0) / tr.length : 0
  const sd = tr.length ? Math.sqrt(tr.reduce((s, t) => s + Math.pow(t.pnl - mean, 2), 0) / tr.length) : 0
  const sharpe = sd ? Math.max(0, Math.min(3.2, (mean / sd) * Math.sqrt(Math.min(tr.length, 30)))) : 0
  const eqA = P.perfSeries(set), ytd = eqA.length > 3 ? (eqA[eqA.length - 1] - eqA[Math.floor(eqA.length * 0.7)]) / start * 100 : 0
  const joined = Math.min.apply(null, set.map((a) => a.openedAt))
  const months = Math.max(1, (Date.now() - joined) / 2592000000), avgMonthly = ret / months
  const alScore = Math.max(1, Math.min(99, 50 + ret * 0.5 - dd * 0.6))
  const eqPct = bal ? eq / bal * 100 : 100
  const joinedStr = new Date(joined).toISOString().slice(0, 10), nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ')
  const hash = hashFor(single ? S.perfAcc : 'ALL-ACCOUNTS')

  const sgc = (l, v, sign) => '<div class="sgc"><div class="sgl">' + l + '</div><div class="sgv' + (sign > 0 ? ' up' : sign < 0 ? ' neg' : '') + '">' + v + '</div></div>'
  const grid = '<div class="sgrid">' +
    sgc('YTD return', pct(ytd), ytd) + sgc('Avg. monthly', pct(avgMonthly), avgMonthly) + sgc('Total profit', money(net), net) + sgc('AL score', alScore.toFixed(2)) +
    sgc('Balance', money(bal)) + sgc('Equity', money(eq) + ' <span class="dim" style="font-size:11px">(' + eqPct.toFixed(1) + '%)</span>') + sgc('Account type', single ? 'live' : 'aggregate') + sgc('Trades', tr.length) +
    sgc('Broker server', 'Tradr Markets') + sgc('Currency', 'GBP') + sgc('Joined', joinedStr) + sgc('Last update', nowStr) + '</div>'

  let body
  if (S.perfView === 'trades') body = P.tradesCardHTML(S, set)
  else if (S.perfView === 'return') body = P.periodCardHTML(S)
  else if (S.perfView === 'risk') body = P.riskCardHTML(dd, sharpe, avgW, avgL, wr, tr)
  else body = P.chartCardHTML(S) + grid + P.liveStripHTML(S, P.perfSet(S))

  // Redraw the canvas each render (ticks trigger re-render → live chart).
  useEffect(() => {
    const c = rootRef.current && rootRef.current.querySelector('#perfChart')
    if (c) P.drawPerfChart(S, c)
  })

  const tabs = ['Overview', 'Return', 'Risk', 'Trades']
  const ranges = ['1D', '1W', '1M', '6M', 'YTD', '1Y', 'MAX']

  return (
    <DataScope className="dash">
      <div ref={rootRef}>
        <div className="ptop">
          <div className="dd"><button className="dd-btn" data-perf-menu>{acctName} <span className="dd-ar">▾</span></button>
            {S.perfMenu && <div className="dd-menu"><button className={'dd-it' + (S.perfAcc === 'all' ? ' on' : '')} data-perf-acc="all">All tournaments</button>
              {S.accounts.map((a) => <button key={a.id} className={'dd-it' + (S.perfAcc === a.id ? ' on' : '')} data-perf-acc={a.id}>{a.id} · {a.cadence}</button>)}</div>}
          </div>
          <div className="dt-row ptabs">{tabs.map((t) => <button key={t} className={'dt' + (S.perfView === t.toLowerCase() ? ' on' : '')} data-perf-view={t.toLowerCase()}>{t}</button>)}</div>
          <div className="rg-row">{ranges.map((r) => <button key={r} className={'rg' + (S.perfRange === r.toLowerCase() ? ' on' : '')} data-perf-range={r.toLowerCase()}>{r}</button>)}</div>
        </div>
        <div className="phead"><div className="pname">{acctName}</div><span className="phash mono">{hash}</span><button className="pf-share" data-shareprofile>↗ Share profile</button></div>
        <div className="sb">
          <div className="sbt"><Html tag="span" className="sbic" style={{ background: 'linear-gradient(145deg,#34d399,#10b981)' }} html={pstatIcon('ret')} /><div className="sbl">Overall return</div><div className={'sbv ' + (ret >= 0 ? 'up' : 'down')}>{pct(ret)}</div></div>
          <div className="sbt"><Html tag="span" className="sbic" style={{ background: 'linear-gradient(145deg,#5b8bff,#2f6bff)' }} html={pstatIcon('win')} /><div className="sbl">Win rate</div><div className="sbv">{wr.toFixed(1)}%</div><div className="sbbar"><span style={{ width: Math.max(0, Math.min(100, wr)) + '%' }}></span></div></div>
          <div className="sbt"><Html tag="span" className="sbic" style={{ background: 'linear-gradient(145deg,#f87171,#e5484d)' }} html={pstatIcon('dd')} /><div className="sbl">Max drawdown</div><div className={'sbv' + (dd > 0 ? ' down' : '')}>{pct(-dd)}</div></div>
          <div className="sbt"><Html tag="span" className="sbic" style={{ background: 'linear-gradient(145deg,#9a7cff,#7c5cff)' }} html={pstatIcon('sharpe')} /><div className="sbl">Sharpe</div><div className="sbv">{sharpe.toFixed(2)}</div></div>
        </div>
        <Html className="pbody" html={body} />
      </div>
    </DataScope>
  )
}
