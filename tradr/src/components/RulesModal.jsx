import React from 'react'
import { useStore } from '../store.jsx'

const RULES = [
  ['Won on performance', 'The pool is paid to the highest performers — nothing else. Every entrant starts with the same £100,000 virtual balance, and final rank is decided by closing equity at the bell. The top of the board takes the largest share, paid down through the ranks.'],
  ['Trade your way', 'Scalp, day-trade, swing, or run your own algorithms — any style, any instrument we list, as many trades as you like. There are no restrictions on how you reach the top.'],
  ['One balance, one shot', 'Each account is sealed at £100,000 — no top-ups, no resets. Manage risk however you choose; you keep your final standing.'],
  ['Fair play only', 'No arbitrage of pricing gaps, no feed or latency exploitation, no collusion, wash trading, or any form of market manipulation. Accounts caught gaming the engine are disqualified and forfeit any prize.'],
  ['Settlement', 'Ranks freeze at the close (July 17 · 00:00). Prizes are paid from the segregated, ring-fenced pool to the final placements.']
]

export default function RulesModal() {
  const { S, set } = useStore()
  if (!S.rulesOpen) return <div className="bm" />
  const close = () => set((s) => { s.rulesOpen = false })
  return (
    <div className="bm show" onClick={(e) => { if (e.target.classList.contains('bm')) close() }}>
      <div className="bmcard rulescard">
        <button className="bm-x" onClick={close}>×</button>
        <div className="bm-eyebrow">July Global Open</div><div className="bm-h">Tournament rules</div>
        {RULES.map(([n, p]) => (
          <div className="rule" key={n}><div className="rn">{n}</div><div className="rp">{p}</div></div>
        ))}
        <button className="btn pink full" onClick={close} style={{ marginTop: 8 }}>Got it</button>
      </div>
    </div>
  )
}
