import React from 'react'
import { useStore } from '../store.jsx'

// Multi-step entry-purchase flow (buy → pay → processing → success).
export default function BuyModal() {
  const { S, closeBuy, setBuyQty, buyNext, buyBack, setPay, buyPay, buyDone } = useStore()
  if (!S.buyOpen) return <div className="bm" />
  const total = S.buyQty * 25
  const tnm = (S.tours[S.tourSel] && S.tours[S.tourSel].name) || 'July Global Open'

  let body
  if (S.buyStep === 1) {
    body = (<>
      <div className="bm-eyebrow">{tnm}</div><div className="bm-h">Buy entries</div>
      <div className="qtybox"><span className="lbl">Entries · £25 each</span>
        <div className="qtyctl"><button className="qtyb" onClick={() => setBuyQty(-1)}>−</button><span className="qtyn">{S.buyQty}</span><button className="qtyb" onClick={() => setBuyQty(1)}>+</button></div></div>
      <div className="sumrow"><span>{S.buyQty} × £25</span><span className="tn">£{total}</span></div>
      <div className="sumrow"><span>Funds the prize pool · 100%</span><span className="tn">£{total}</span></div>
      <div className="sumrow tot"><span>Total</span><span className="tn">£{total}</span></div>
      <div className="bm-note">Each entry gives a £100,000 competition balance and a place on the board. Paid entry available where licensed.</div>
      <button className="btn pink full" onClick={buyNext}>Continue to payment</button>
    </>)
  } else if (S.buyStep === 2) {
    body = (<>
      <div className="bm-eyebrow">Payment · £{total}</div><div className="bm-h">How would you like to pay?</div>
      <div className="bm-pay">
        <button className={'paychip' + (S.pay === 'card' ? ' on' : '')} onClick={() => setPay('card')}>Card</button>
        <button className={'paychip' + (S.pay === 'apple' ? ' on' : '')} onClick={() => setPay('apple')}>Apple Pay</button>
        <button className={'paychip' + (S.pay === 'crypto' ? ' on' : '')} onClick={() => setPay('crypto')}>Crypto</button>
      </div>
      {S.pay === 'card' ? (<>
        <div className="fld"><label>Card number</label><input placeholder="4242 4242 4242 4242" inputMode="numeric" /></div>
        <div className="fld2"><div className="fld"><label>Expiry</label><input placeholder="MM / YY" /></div><div className="fld"><label>CVC</label><input placeholder="123" inputMode="numeric" /></div></div>
        <div className="fld"><label>Name on card</label><input placeholder="J Stone" /></div>
      </>) : (<div className="bm-note">You’ll confirm in the {S.pay === 'apple' ? 'Apple Pay sheet' : 'wallet'} after tapping pay.</div>)}
      <button className="btn pink full" onClick={buyPay}>Pay £{total}</button>
      <button className="btn full" onClick={buyBack} style={{ marginTop: 9 }}>Back</button>
    </>)
  } else if (S.buyStep === 3) {
    body = <div className="bm-processing"><div className="spin"></div>Processing payment…</div>
  } else {
    body = (<div className="bm-success"><div className="bm-tick">✓</div><div className="bm-h" style={{ marginBottom: 6 }}>You’re in</div>
      <div className="bm-note" style={{ marginBottom: 18 }}>{S.buyQty} entr{S.buyQty > 1 ? 'ies' : 'y'} confirmed · you’ve joined {tnm} with a £100,000 balance.</div>
      <button className="btn pink full" onClick={buyDone}>View leaderboard</button></div>)
  }

  return (
    <div className="bm show" onClick={(e) => { if (e.target.classList.contains('bm')) closeBuy() }}>
      <div className="bmcard">
        <button className="bm-x" onClick={closeBuy}>×</button>
        {S.buyStep < 3 && <div className="bm-steps">{[1, 2, 3].map((s) => <div key={s} className={'bm-step' + (S.buyStep >= s ? ' on' : '')}></div>)}</div>}
        {body}
      </div>
    </div>
  )
}
