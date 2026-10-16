import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client.js'
import AnimatedNumber from '../components/AnimatedNumber.jsx'
import Badges from '../components/Badges.jsx'
import CountdownRing from '../components/CountdownRing.jsx'
import GrowTree from '../components/GrowTree.jsx'
import { currencySymbol, formatMoney } from '../lib/money.js'
import { pickupLabel } from '../lib/time.js'

const STATUS = {
  RESERVED: { label: 'Waiting for you', className: 'status--available' },
  COLLECTED: { label: 'Collected', className: 'status--available' },
  CANCELLED: { label: 'Cancelled', className: 'status--cancelled' },
  EXPIRED: { label: 'Not collected', className: 'status--expired' },
}

function RescueTicket({ reservation, onCancel }) {
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const { listing } = reservation
  const active = reservation.status === 'RESERVED'
  const start = Date.parse(listing.pickupStart)
  const end = Date.parse(listing.pickupEnd)

  async function cancel() {
    setBusy(true)
    await onCancel(reservation)
    setBusy(false)
    setConfirming(false)
  }

  return (
    <article className={`rticket${active ? '' : ' rticket--past'}`}>
      <div className="rticket__main">
        <div className="lrow__title">
          <h3>{listing.title}</h3>
          <span className={`status ${STATUS[reservation.status].className}`}>{STATUS[reservation.status].label}</span>
        </div>
        <p className="lrow__meta">{listing.businessName}, {listing.address}, {listing.city}</p>
        <p className="lrow__meta">{pickupLabel(listing.pickupStart, listing.pickupEnd)}</p>
        <p className="rticket__total">
          {reservation.quantity} × {formatMoney(Number(reservation.unitPrice))} = <strong>{formatMoney(Number(reservation.totalPrice))}</strong>
          <span> to pay at the counter</span>
        </p>
      </div>

      {active && (
        <div className="rticket__stub">
          <div className="rticket__code">
            <span>Pickup code</span>
            <strong aria-label={`Pickup code ${reservation.pickupCode.split('').join(' ')}`}>{reservation.pickupCode}</strong>
          </div>
          <CountdownRing closesAt={end} windowMinutes={Math.max(15, Math.round((end - start) / 60000))} />
          {!confirming ? (
            <button type="button" className="btn btn--small btn--ghost" onClick={() => setConfirming(true)}>Cancel</button>
          ) : (
            <div className="lrow__confirm" role="alert">
              <p>Give the food back to the neighbourhood?</p>
              <div className="lrow__actions">
                <button type="button" className="btn btn--small" disabled={busy} onClick={cancel}>{busy ? 'Cancelling…' : 'Yes, cancel'}</button>
                <button type="button" className="btn btn--small btn--ghost" onClick={() => setConfirming(false)}>Keep it</button>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  )
}

export default function MyRescues() {
  const [items, setItems] = useState([])
  const [phase, setPhase] = useState('loading')
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const timer = useRef(null)

  useEffect(() => {
    let cancelled = false
    setPhase('loading')
    api.reservations
      .mine()
      .then((res) => !cancelled && (setItems(res.content), setPhase('ready')))
      .catch((err) => !cancelled && (setError(err), setPhase('error')))
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  useEffect(() => () => clearTimeout(timer.current), [])

  async function cancel(reservation) {
    try {
      const updated = await api.reservations.cancel(reservation.id)
      setItems((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
      setNotice('Reservation cancelled. Thanks for letting someone else have it.')
    } catch (err) {
      setNotice(err.message)
    }
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setNotice(''), 4500)
  }

  const { upcoming, history, rescued, impact } = useMemo(() => {
    const collected = items.filter((r) => r.status === 'COLLECTED')
    const portions = collected.reduce((sum, r) => sum + r.quantity, 0)
    const kg = portions * 0.45
    return {
      upcoming: items.filter((r) => r.status === 'RESERVED'),
      history: items.filter((r) => r.status !== 'RESERVED'),
      rescued: portions,
      impact: {
        portions,
        kg,
        co2: kg * 2.5,
        saved: collected.reduce((sum, r) => sum + Math.max(0, Number(r.listing.originalPrice ?? r.unitPrice) - Number(r.unitPrice)) * r.quantity, 0),
        bakery: collected.filter((r) => r.listing.category === 'BAKERY').reduce((sum, r) => sum + r.quantity, 0),
        places: new Set(collected.map((r) => r.listing.businessName)).size,
      },
    }
  }, [items])

  return (
    <div className="page dash">
      <div className="panel dash__head">
        <div>
          <h1>My rescues</h1>
          <p className="hand">{rescued > 0 ? `${rescued} ${rescued === 1 ? 'portion' : 'portions'} saved from the bin so far` : 'your first rescue is waiting'}</p>
        </div>
        <Link to="/discover" className="btn btn--accent">Find more food</Link>
      </div>

      {phase === 'loading' && <p className="loading" role="status">Loading your rescues…</p>}

      {phase === 'error' && (
        <div className="empty" role="alert">
          <h2 style={{ fontSize: 'var(--step-2)' }}>We couldn’t load your rescues</h2>
          <p>{error?.message}</p>
          <button type="button" className="btn btn--small" onClick={() => setReloadKey((k) => k + 1)}>Try again</button>
        </div>
      )}

      {phase === 'ready' && items.length === 0 && (
        <div className="empty">
          <h2 style={{ fontSize: 'var(--step-2)' }}>Nothing reserved yet</h2>
          <p>Browse what kitchens near you have left today and rescue your first meal.</p>
          <Link to="/discover" className="btn">Find food</Link>
        </div>
      )}

      {phase === 'ready' && (
        <section className="panel panel--mint rescue-garden" aria-labelledby="garden-title">
          <h2 id="garden-title" className="visually-hidden">Your rescue tree and badges</h2>
          <GrowTree portions={impact.portions} />
          <Badges stats={impact} />
          <div className="results rescue-garden__stats">
            <p className="result"><strong><AnimatedNumber value={impact.portions} /></strong><span>portions rescued</span></p>
            <p className="result"><strong><AnimatedNumber value={impact.kg} decimals={1} suffix=" kg" /></strong><span>of food kept out of the bin</span></p>
            <p className="result"><strong><AnimatedNumber value={impact.co2} decimals={1} suffix=" kg" /></strong><span>CO₂e avoided, roughly</span></p>
            <p className="result"><strong><AnimatedNumber value={impact.saved} prefix={currencySymbol} /></strong><span>saved against full prices</span></p>
          </div>
        </section>
      )}

      {phase === 'ready' && upcoming.length > 0 && (
        <section className="panel dash__section" aria-labelledby="upcoming-title">
          <h2 id="upcoming-title" className="dash__h">Ready for pickup</h2>
          <div className="dash__list">
            {upcoming.map((r) => <RescueTicket key={r.id} reservation={r} onCancel={cancel} />)}
          </div>
        </section>
      )}

      {phase === 'ready' && history.length > 0 && (
        <section className="panel dash__section" aria-labelledby="history-title">
          <h2 id="history-title" className="dash__h">History</h2>
          <div className="dash__list">
            {history.map((r) => <RescueTicket key={r.id} reservation={r} onCancel={cancel} />)}
          </div>
        </section>
      )}

      {notice && <p className="toast" role="status">{notice}</p>}
    </div>
  )
}
