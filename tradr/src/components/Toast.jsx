import React, { useEffect, useState, useRef } from 'react'
import { useStore } from '../store.jsx'

// Transient toast. Shows for ~1.9s whenever S._toastId changes.
export default function Toast() {
  const { S } = useStore()
  const [show, setShow] = useState(false)
  const last = useRef(0)
  const timer = useRef(null)
  useEffect(() => {
    if (S._toastId !== last.current) {
      last.current = S._toastId
      if (S.toast) {
        setShow(true)
        clearTimeout(timer.current)
        timer.current = setTimeout(() => setShow(false), 1900)
      }
    }
  })
  useEffect(() => () => clearTimeout(timer.current), [])
  return <div className={'toast' + (show ? ' show' : '')}>{S.toast}</div>
}
