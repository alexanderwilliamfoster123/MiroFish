import React from 'react'
import { useStore } from '../store.jsx'
import { TITLES } from '../engine/data.js'

// Fallback for views reachable by deep links that aren't part of the primary
// nav surface in this port (e.g. trader, account, arena, hall of fame).
export default function Placeholder() {
  const { S, navigate } = useStore()
  return (
    <div>
      <div className="ey">Tradr</div>
      <div className="card" style={{ padding: 28 }}>
        <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>{TITLES[S.view] || 'Screen'}</div>
        <div className="dim" style={{ marginBottom: 18, maxWidth: 520 }}>
          This screen is reachable in the prototype but isn’t part of the primary navigation surface
          ported here yet. The core product — tournaments, the trade terminal, performance, feed,
          invites and the partner portal — is fully live with the running simulation.
        </div>
        <button className="btn" onClick={() => navigate('tournament')}>Back to Tournaments</button>
      </div>
    </div>
  )
}
