import React, { useState } from 'react'
import { useStore } from '../store.jsx'
import { avSeed } from '../engine/format.js'
import { avEmoji } from '../engine/builders2.js'
import { feedData, feedItemHTML } from '../engine/feed.js'
import Html from '../components/Html.jsx'
import DataScope from '../components/DataScope.jsx'

export default function FeedView() {
  const { S, force } = useStore()
  const [draft, setDraft] = useState('')
  const filt = S.feedFilter || 'all'

  const items = feedData()
  const mine = (S.feedPosts || []).map((t, k) => ({ id: 'mine' + k, h: 'jstone', cc: 'GB', ty: 'thought', when: 'now', text: t, likes: 0, replies: 0, reposts: 0, views: 0 }))
  let all = mine.concat(items)
  if (filt !== 'all') all = all.filter((it) => filt === 'battles' ? (it.ty === 'callout') : filt === 'results' ? (it.ty === 'result') : true)

  const post = () => { const v = draft.trim(); if (v) { S.feedPosts = S.feedPosts || []; S.feedPosts.unshift(v); setDraft(''); force() } }
  const chips = [['all', 'For you'], ['battles', 'Battles'], ['results', 'Results']]

  return (
    <DataScope className="fdpage">
      <div className="fd-fils">{chips.map((c) => <button key={c[0]} className={'fd-fil' + (filt === c[0] ? ' on' : '')} data-fdfilter={c[0]}>{c[1]}</button>)}</div>
      <div className="fd-composer">
        <Html tag="span" className="fd-av fd-av-me" data-trader="jstone" style={{ background: avSeed('jstone') }} html={avEmoji(S, 'jstone')} />
        <input className="fd-input" placeholder="Share a thought, photo or call someone out…" maxLength={240} value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') post() }} />
        <button className="fd-postbtn" onClick={post}>Post</button>
      </div>
      <Html className="fd-list" html={all.map((it) => feedItemHTML(S, it)).join('')} />
    </DataScope>
  )
}
