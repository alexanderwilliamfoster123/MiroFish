import React, { useEffect, useRef } from 'react'
import { useStore } from '../store.jsx'
import { affiliateHTML, drawAffChart } from '../engine/affiliate.js'
import Html from '../components/Html.jsx'
import DataScope from '../components/DataScope.jsx'

export default function AffiliateView() {
  const { S } = useStore()
  const rootRef = useRef(null)

  useEffect(() => {
    const c = rootRef.current && rootRef.current.querySelector('#affChart')
    if (c) drawAffChart(S, c)
  })

  return (
    <DataScope>
      <div ref={rootRef} dangerouslySetInnerHTML={{ __html: affiliateHTML(S) }} />
    </DataScope>
  )
}
