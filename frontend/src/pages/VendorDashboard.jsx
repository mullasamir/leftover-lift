import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { api } from '../api/client.js'
import { categoryLabel, STATUS_LABELS } from '../api/adapters.js'
import CountdownRing from '../components/CountdownRing.jsx'
import PickupDesk from '../components/PickupDesk.jsx'
import Reveal from '../components/Reveal.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { formatMoney } from '../lib/money.js'
import { pickupLabel } from '../lib/time.js'

const LIVE = ['AVAILABLE', 'SOLD_OUT']

function ListingRow({ listing, onCancel }) {
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const live = LIVE.includes(listing.status)
  const end = Date.parse(listing.pickupEnd)
  const start = Date.parse(listing.pickupStart)

  async function confirmCancel() {
    setBusy(true)
    await onCancel(listing)
    setBusy(false)
    setConfirming(false)
  }

  return (
    <article className={`lrow${live ? '' : ' lrow--past'}`}>
      <div className="lrow__main">
        <div className="lrow__title">
          <h3>{listing.title}</h3>
          <span className={`status status--${listing.status.toLowerCase()}`}>{STATUS_LABELS[listing.status]}</span>
        </div>
        <p className="lrow__meta">{categoryLabel(listing.category)}</p>
        <p className="lrow__meta">{pickupLabel(listing.pickupStart, listing.pickupEnd)}</p>
        <p className="lrow__price">
          <strong>{formatMoney(Number(listing.rescuePrice))}</strong>
          <s>{formatMoney(Number(listing.originalPrice))}</s>
          <span className="pill">{listing.discountPercent}% off</span>
        </p>
        <p className="lrow__stock">
          <strong>{listing.quantityRemaining}</strong> of {listing.quantityTotal} portions left
        </p>
      </div>

      <div className="lrow__side">
        {listing.status === 'AVAILABLE' && (
          <CountdownRing closesAt={end} windowMinutes={Math.max(15, Math.round((end - start) / 60000))} />
        )}
        {live && !confirming && (
          <div className="lrow__actions">
            <Link to={`/vendor/${listing.id}/edit`} className="btn btn--small btn--ghost">Edit</Link>
            <button type="button" className="btn btn--small btn--ghost" onClick={() => setConfirming(true)}>Cancel</button>
          </div>
        )}
        {confirming && (
          <div className="lrow__confirm" role="alert">
            <p>Neighbours will no longer see this. Cancel it?</p>
            <div className="lrow__actions">
              <button type="button" className="btn btn--small" disabled={busy} onClick={confirmCancel}>{busy ? 'Cancelling…' : 'Yes, cancel'}</button>
              <button type="button" className="btn btn--small btn--ghost" onClick={() => setConfirming(false)}>Keep it</button>
            </div>
          </div>
        )}
      </div>
    </article>
  )
}

export default function VendorDashboard() {
  const { user } = useAuth()
  const location = useLocation()
  const [listings, setListings] = useState([])
  const [phase, setPhase] = useState('loading')
  const [error, setError] = useState(null)
  const [flash, setFlash] = useState(location.state?.flash ?? '')
  const [reloadKey, setReloadKey] = useState(0)
  const timer = useRef(null)

  useEffect(() => {
    let cancelled = false
    setPhase('loading')
    api.vendor
      .list()
      .then((res) => !cancelled && (setListings(res.content), setPhase('ready')))
      .catch((err) => !cancelled && (setError(err), setPhase('error')))
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  useEffect(() => {
    if (!flash) return undefined
    timer.current = setTimeout(() => setFlash(''), 4500)
    return () => clearTimeout(timer.current)
  }, [flash])

  async function cancel(listing) {
    try {
      const updated = await api.vendor.cancel(listing.id)
      setListings((prev) => prev.map((l) => (l.id === updated.id ? updated : l)))
      setFlash('Listing cancelled.')
    } catch (err) {
      setFlash(err.message)
    }
  }

  const { live, past, portions } = useMemo(() => {
    const liveItems = listings.filter((l) => LIVE.includes(l.status))
    return {
      live: liveItems,
      past: listings.filter((l) => !LIVE.includes(l.status)),
      portions: liveItems.reduce((sum, l) => sum + l.quantityRemaining, 0),
    }
  }, [listings])

  return (
    <div className="page dash">
      <div className="panel dash__head">
        <div>
          <h1>{user.vendor?.businessName ?? 'Your listings'}</h1>
          <p className="hand">what is left today?</p>
        </div>
        <Link to="/vendor/new" className="btn btn--accent">Post surplus food</Link>
      </div>

      <PickupDesk />

      {phase === 'ready' && (
        <div className="stats stats--dash">
          <p className="stat"><strong>{live.length}</strong><span>live listings</span></p>
          <p className="stat"><strong>{portions}</strong><span>portions left</span></p>
          <p className="stat"><strong>{past.length}</strong><span>past listings</span></p>
        </div>
      )}

      {phase === 'loading' && <p className="loading" role="status">Loading your listings…</p>}

      {phase === 'error' && (
        <div className="empty" role="alert">
          <h2 style={{ fontSize: 'var(--step-2)' }}>We couldn’t load your listings</h2>
          <p>{error?.message}</p>
          <button type="button" className="btn btn--small" onClick={() => setReloadKey((k) => k + 1)}>Try again</button>
        </div>
      )}

      {phase === 'ready' && listings.length === 0 && (
        <div className="empty">
          <h2 style={{ fontSize: 'var(--step-2)' }}>Nothing posted yet</h2>
          <p>Made more than you sold today? Post your first surplus in under a minute and let the neighbourhood come and get it.</p>
          <Link to="/vendor/new" className="btn">Post surplus food</Link>
        </div>
      )}

      {phase === 'ready' && live.length > 0 && (
        <section aria-labelledby="live-title" className="panel dash__section">
          <h2 id="live-title" className="dash__h">Live now</h2>
          <div className="dash__list">
            {live.map((l) => <Reveal key={l.id} variant="rise"><ListingRow listing={l} onCancel={cancel} /></Reveal>)}
          </div>
        </section>
      )}

      {phase === 'ready' && past.length > 0 && (
        <section aria-labelledby="past-title" className="panel dash__section">
          <h2 id="past-title" className="dash__h">Past listings</h2>
          <div className="dash__list">
            {past.map((l) => <ListingRow key={l.id} listing={l} onCancel={cancel} />)}
          </div>
        </section>
      )}

      {flash && <p className="toast" role="status">{flash}</p>}
    </div>
  )
}
