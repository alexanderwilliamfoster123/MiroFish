import React, { useEffect, useRef } from 'react'
import { useStore } from '../store.jsx'
import { money, gbp2, pct, pxv } from '../engine/format.js'
import { statIcon, symTint, symIcon } from '../engine/icons.js'
import { bestRank } from '../engine/sim.js'
import * as T from '../engine/terminal.js'
import Html from '../components/Html.jsx'

export default function TerminalView() {
  const { S, set, termPlace, termBE, termClose, termSwitchAcct } = useStore()
  const rootRef = useRef(null)
  const t = S.term
  const s = t.asset, a = S.instr[s]
  const chg = (a.price - a.open) / a.open * 100
  const ra = T.termRiskAmt(S), rw = T.termRewardAmt(S)
  const pos = t.pos
  const curAcc = S.accounts.filter((ac) => ac.id === t.acct)[0] || S.accounts[0]

  // draw + keep the candle chart live each render (ticks re-render)
  useEffect(() => {
    const c = rootRef.current && rootRef.current.querySelector('#tmChart')
    if (c) T.drawTermChart(S, c, rootRef.current)
  })

  const tfs = ['1m', '5m', '15m', '1H', '1D']
  const inds = [['sma9', 'MA 9'], ['sma21', 'MA 21']]
  const modes = ['scalp', 'day', 'swing']
  const risks = [1, 5, 10, 25]

  // position live pnl (computed each render)
  let posPnl = 0, mkPct = 50
  if (pos) {
    const price = S.instr[pos.sym].price
    const prog = pos.dir === 'up' ? (price - pos.entry) / (pos.entry - pos.sl) : (pos.entry - price) / (pos.sl - pos.entry)
    posPnl = prog * pos.risk
    const span = pos.winEnd - pos.lossEnd; mkPct = Math.max(2, Math.min(98, (price - pos.lossEnd) / span * 100))
  }

  // delegated handler for the ported table chunks (BE / Close buttons)
  const onTableClick = (e) => {
    const be = e.target.closest('[data-bepos]'); if (be) { termBE(be.dataset.bepos); return }
    const cl = e.target.closest('[data-closepos]'); if (cl) { termClose(cl.dataset.closepos); return }
  }

  return (
    <div className="tmwrap" ref={rootRef}>
      <div className="sb tmstats">
        <div className="sbt"><Html tag="span" className="sbic" style={{ background: 'linear-gradient(145deg,#34d399,#10b981)' }} html={statIcon('equity')} /><div className="sbl">Practice balance · {t.acct}</div><div className="sbv tn">{money(t.bal)}</div></div>
        <div className="sbt"><Html tag="span" className="sbic" style={{ background: 'linear-gradient(145deg,#ffc24b,#f59e0b)' }} html={statIcon('rank')} /><div className="sbl">Best rank</div><div className="sbv tn">#{bestRank(S)}</div></div>
        <div className="sbt"><Html tag="span" className="sbic" style={{ background: 'linear-gradient(145deg,#9a7cff,#7c5cff)' }} html={statIcon('pnl')} /><div className="sbl">Win streak</div><div className="sbv tn">{t.streak}</div></div>
        <div className="sbt"><Html tag="span" className="sbic" style={{ background: 'linear-gradient(145deg,#5b8bff,#2f6bff)' }} html={statIcon('equity')} /><div className="sbl">Total winnings</div><div className="sbv tn">{money(S.wins)}</div></div>
      </div>

      <div className="tmacct-dd">
        <button className={'tmacct-btn' + (t.acctMenu ? ' open' : '')} onClick={() => set((st) => { st.term.acctMenu = !st.term.acctMenu })}>
          <span className="tmacct-lab">Account</span><span className="tmacct-cur"><span className="tmacct-id">{curAcc.id}</span><small>{curAcc.cadence}</small></span>
          <svg className="tmacct-cv" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <div className={'tmacct-menu' + (t.acctMenu ? ' show' : '')}>
          {S.accounts.map((ac) => (
            <button key={ac.id} className={'tmacct-it' + (ac.id === t.acct ? ' on' : '')} onClick={() => termSwitchAcct(ac.id)}>
              <span className="tmacct-id">{ac.id}</span><small>{ac.cadence} · {money(100000)}</small>{ac.id === t.acct && <span className="tmacct-ck">✓</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="tmgrid">
        <div className="tmleft">
          <div className="tmassets">
            {T.TASSETS.map((k) => (
              <button key={k} className={'tmchip' + (k === s ? ' on' : '')} onClick={() => set((st) => { st.term.asset = k; st.term.spark = []; st.term.order.t = { entry: false, sl: false, tp: false } })}>
                <Html tag="span" className="tmci" style={{ background: symTint(k) }} html={symIcon(k)} />
                <span className="tmct"><span className="s">{k}</span><span className="p tn">{T.px(S, k)}</span></span>
              </button>
            ))}
          </div>
          <div className="tmchart-card">
            <div className="tmc-head"><div><div className="tmc-sym">{s} <span>{a.name}</span></div><div className="tmc-ohlc" id="tmcOHLC"></div></div>
              <div className="tmc-last"><div className="tmc-lpx tn">{T.px(S, s)}</div><div className={'tmc-lch ' + (chg >= 0 ? 'up' : 'down')} id="tmcLch">{pct(chg)}</div></div></div>
            <div className="tmc-tfs">{tfs.map((tf) => <button key={tf} className={'tmc-tf' + (tf === (t.tf || '5m') ? ' on' : '')} onClick={() => set((st) => { st.term.tf = tf; st.term.cross = null })}>{tf}</button>)}</div>
            <div className="tmc-inds">{inds.map((d) => <button key={d[0]} className={'tmc-ind' + ((t.inds || {})[d[0]] ? ' on' : '')} onClick={() => set((st) => { st.term.inds = st.term.inds || {}; st.term.inds[d[0]] = !st.term.inds[d[0]] })}>{d[1]}</button>)}</div>
            <canvas id="tmChart"></canvas>
          </div>
        </div>

        <div className="tmright">
          <div className="tmuiseg">
            <button className={'tmui-b' + (t.ui === 'simple' ? ' on' : '')} onClick={() => set((st) => { st.term.ui = 'simple' })}><b>Simple</b><small>one-tap</small></button>
            <button className={'tmui-b' + (t.ui === 'manual' ? ' on' : '')} onClick={() => set((st) => { st.term.ui = 'manual' })}><b>Manual</b><small>limit · own SL/TP</small></button>
          </div>
          <div className="tmlbl">Style <span className="hint tn">{T.TMODES[t.mode].pips} · {T.TMODES[t.mode].sub}</span></div>
          <div className="tmseg tmmode">{modes.map((m) => <button key={m} className={'tmseg-b' + (m === t.mode ? ' on' : '')} onClick={() => set((st) => { st.term.mode = m })}>{T.TMODES[m].lbl}<small>{T.TMODES[m].pips}</small></button>)}</div>
          <div className="tmsect" style={{ marginTop: 14 }}>
            <div className="tmlbl">How much to risk <span className="hint tn">{gbp2(ra)}</span></div>
            <div className="tmrisks">{risks.map((r) => <button key={r} className={'tmrbtn' + (r === t.risk ? ' on' : '')} onClick={() => set((st) => { st.term.risk = r })}><span className="v tn">{r}%</span><span className="a tn">{gbp2(t.bal * r / 100)}</span></button>)}</div>
          </div>
          <div className="tmsect">
            <div className="tmrr"><div className="tmrr-t"><span>Reward target</span><span className="tn">1 : {t.rr.toFixed(1)}</span></div>
              <div className="tmplain">Risk <b>{gbp2(ra)}</b> to win <b>{gbp2(rw)}</b>.</div>
              <input type="range" min="1" max="5" step="0.5" value={t.rr} onChange={(e) => set((st) => { st.term.rr = parseFloat(e.target.value) })} />
            </div>
          </div>
          <div className="tmdirs">
            <button className="tmdir up" onClick={() => termPlace('up')}><div className="g">▲</div><div className="t">BUY</div><div className="sub">go long</div></button>
            <button className="tmdir down" onClick={() => termPlace('down')}><div className="g">▼</div><div className="t">SELL</div><div className="sub">go short</div></button>
          </div>
          {pos && (
            <div className="tmposn">
              <div className="tmpo-h"><div className="tmpo-sym">{pos.sym} <span>{pos.dir === 'up' ? 'Buy' : 'Sell'}</span></div><div className="tmpo-tag">LIVE</div></div>
              <div className={'tmpnl tn ' + (posPnl >= 0 ? 'up' : 'down')}>{(posPnl >= 0 ? '+' : '−') + gbp2(Math.abs(posPnl))}</div>
              <div className="tmpo-sub">entry {pxv(pos.entry)} · now {pxv(S.instr[pos.sym].price)}</div>
              <div className="tmrace"><div className="tmrace-tk"><div className="tmrace-mid"></div><div className="tmrace-mk" style={{ left: mkPct + '%' }}></div></div><div className="tmrace-e"><span>Loss</span><span style={{ textAlign: 'center' }}>Entry</span><span style={{ textAlign: 'right' }}>Win</span></div></div>
              <div className="tmpo-act">{pos.be ? <button className="tmbe done" disabled>At breakeven ✓</button> : <button className="tmbe" onClick={() => termBE(pos.id)}>Breakeven</button>}<button className="tmclose" onClick={() => termClose(pos.id)}>Close now</button></div>
            </div>
          )}
        </div>
      </div>

      <div className="tmtrack" onClick={onTableClick}>
        <div className="tmtk-col">
          <div className="tmtk-h">Working orders <span className="tmtk-n">0</span></div>
          <div className="tmempty">Limit orders are part of Manual mode — one-tap Simple trading is fully live here.</div>
          <div className="tmtk-h" style={{ marginTop: 16 }}>Open positions <span className="tmtk-n">{S.positions.filter((q) => q.acct === t.acct).length}</span></div>
          <Html html={T.termOpenTable(S)} />
        </div>
        <div className="tmtk-col"><div className="tmtk-h">Trade history</div><Html html={T.termHistTable(S)} /></div>
      </div>
      <div className="tmfoot">Practice mode · virtual balance · skill competition. No real money at risk.</div>
    </div>
  )
}
