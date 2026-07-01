import React from 'react'
import { useStore } from '../store.jsx'

export default function NotifPanel() {
  const { S, clearNotif } = useStore()
  return (
    <div className={'notif-panel' + (S.notifOpen ? ' show' : '')}>
      <div className="np-h"><span>Notifications</span><button className="np-clear" onClick={clearNotif}>Mark all read</button></div>
      <div className="np-list">
        {S.notifs.length ? S.notifs.map((n, i) => (
          <div className="np-row" key={i}>
            <span className={'nt-ic ' + n.cls}>{n.ic}</span>
            <div className="nt-tx"><div className="nt-t">{n.title}</div><div className="nt-s">{n.sub}</div></div>
            <span className="np-ago mono">{n.ago || 'now'}</span>
          </div>
        )) : <div className="np-empty">No notifications yet.</div>}
      </div>
    </div>
  )
}
