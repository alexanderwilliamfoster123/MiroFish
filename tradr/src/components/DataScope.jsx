import React from 'react'
import { useStore } from '../store.jsx'

const SEL = '[data-href],[data-v],[data-go],[data-buyopen],[data-join],[data-rules],[data-toast],[data-tourenter],[data-tour],[data-lbpage],[data-tourtab],[data-trade-acc],[data-acc],[data-trader],[data-compinvite],[data-perf-menu],[data-perf-acc],[data-perf-view],[data-perf-unit],[data-perf-range],[data-shareacct],[data-shareprofile],[data-fdfilter],[data-fdlike],[data-fdrepost],[data-fdreply],[data-fdshare],[data-fdaccept],[data-arwatch],[data-like],[data-afftab],[data-affchart],[data-affcopy],[data-invseg],[data-invtab],[data-invctab],[data-invaccept],[data-invdecline],[data-invcancel],[data-compjoin],[data-compdecline],[data-compcancel]'

// Wraps ported HTML chunks and bridges prototype-style data-attribute clicks to the store.
export default function DataScope({ children, tag = 'div', ...rest }) {
  const { handleData } = useStore()
  const Tag = tag
  const onClick = (e) => {
    const el = e.target.closest(SEL)
    if (el) handleData(el)
  }
  return <Tag onClick={onClick} {...rest}>{children}</Tag>
}
