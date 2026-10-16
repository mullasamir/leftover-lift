import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client.js'
import { confetti } from '../lib/confetti.js'
import { formatMoney } from '../lib/money.js'
import { pickupLabel } from '../lib/time.js'

/** Where a business confirms a handover: the customer reads out their code, the business types it in. */
export default function PickupDesk() {
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(null) // { ok, text }
  const [waiting, setWaiting] = useState([])

  const loadWaiting = useCallback(() => {
    api.vendor.waiting().then(setWaiting).catch(() => {})
  }, [])

  useEffect(() => loadWaiting(), [loadWaiting])

  async function confirm(e) {
    e.preventDefault()
    if (!code.trim()) return
    setBusy(true)
    setMessage(null)
    try {
      const r = await api.vendor.collect(code)
      setMessage({ ok: true, text: `Handed over: ${r.quantity} × ${r.listingTitle} to ${r.customerName}. Thank you!` })
      setCode('')
      confetti({ count: 60 })
      loadWaiting()
    } catch (err) {
      setMessage({ ok: false, text: err.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="panel desk" aria-labelledby="desk-title">
      <div className="desk__head">
        <h2 id="desk-title" className="dash__h">Pickup desk</h2>
        <p className="desk__sub">When someone arrives, ask for their 6-character code.</p>
      </div>

      <form className="desk__form" onSubmit={confirm}>
        <div className="field">
          <label htmlFor="pickup-code" className="visually-hidden">Customer’s pickup code</label>
          <input
            id="pickup-code" className="desk__input" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="K7QX2M" maxLength={10} autoComplete="off" autoCapitalize="characters" spellCheck="false" inputMode="text"
          />
        </div>
        <button className="btn btn--accent" disabled={busy || !code.trim()}>{busy ? 'Checking…' : 'Confirm pickup'}</button>
      </form>

      {message && <p className={message.ok ? 'desk__ok' : 'alert'} role={message.ok ? 'status' : 'alert'}>{message.text}</p>}

      <div className="desk__waiting">
        <h3>Waiting for pickup {waiting.length > 0 && <span className="pill">{waiting.length}</span>}</h3>
        {waiting.length === 0 ? (
          <p className="desk__empty">No one is on their way right now.</p>
        ) : (
          <ul>
            {waiting.map((w) => (
              <li key={w.id}>
                <span><strong>{w.customerName}</strong>, {w.quantity} × {w.listingTitle}</span>
                <span className="lrow__meta">{formatMoney(Number(w.totalPrice))}, until {pickupLabel(new Date().toISOString(), w.pickupEnd).replace('Pick up until ', '')}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
