import React from 'react'
import { useStore } from '../store.jsx'
import { invitesHub } from '../engine/invites.js'
import DataScope from '../components/DataScope.jsx'

export default function InvitesView() {
  const { S } = useStore()
  return (
    <DataScope>
      <div dangerouslySetInnerHTML={{ __html: invitesHub(S) }} />
    </DataScope>
  )
}
