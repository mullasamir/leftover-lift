import { useState } from 'react'
import { api } from '../../api/client.js'
import { categoryLabel, STATUS_LABELS } from '../../api/adapters.js'
import Pager from '../../components/Pager.jsx'
import { formatDateTime } from '../../lib/format.js'
import { useDebounced, useFetch } from '../../lib/hooks.js'
import { formatMoney } from '../../lib/money.js'

const FILTERS = [
  { id: '', label: 'All food' },
  { id: 'AVAILABLE', label: 'Live' },
  { id: 'SOLD_OUT', label: 'Sold out' },
  { id: 'EXPIRED', label: 'Ended' },
  { id: 'CANCELLED', label: 'Cancelled' },
]
const LIVE = ['AVAILABLE', 'SOLD_OUT']

export default function FoodTab({ notify, onChange }) {
  const [status, setStatus] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)
  const [confirming, setConfirming] = useState(null)
  const debounced = useDebounced(query)
  const { phase, data, error, setData } = useFetch(
    () => api.admin.listings({ status, q: debounced.trim(), page, size: 10 }),
    [status, debounced, page],
  )

  async function cancel(listing) {
    try {
      const updated = await api.admin.cancelListing(listing.id)
      setData((d) => ({ ...d, content: d.content.map((l) => (l.id === updated.id ? updated : l)) }))
      notify(`“${listing.title}” was taken down and any reservations on it were released.`)
      onChange?.()
    } catch (err) {
      notify(err.message)
    }
    setConfirming(null)
  }

  return (
    <section className="panel admin-section" aria-labelledby="food-title">
      <h2 id="food-title">All food listings</h2>
      <div className="controls controls--single">
        <div className="field search">
          <label className="visually-hidden" htmlFor="food-q">Search food</label>
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5" /><path d="M13 13l4 4" /></svg>
          <input id="food-q" type="search" placeholder="Search by food or business…" value={query} onChange={(e) => { setQuery(e.target.value); setPage(0) }} />
        </div>
      </div>
      <div className="chips" role="group" aria-label="Filter by status">
        {FILTERS.map((f) => (
          <button key={f.id} type="button" className="chip" aria-pressed={status === f.id} onClick={() => { setStatus(f.id); setPage(0) }}>{f.label}</button>
        ))}
      </div>

      {phase === 'error' && <p className="alert" role="alert">{error?.message}</p>}

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th scope="col">Food</th><th scope="col">Business</th><th scope="col">Price</th><th scope="col">Portions</th><th scope="col">Pickup window</th><th scope="col">Status</th><th scope="col"><span className="visually-hidden">Actions</span></th></tr>
          </thead>
          <tbody>
            {data?.content.map((l) => (
              <tr key={l.id}>
                <td data-label="Food"><strong>{l.title}</strong><br /><small>{categoryLabel(l.category)}</small></td>
                <td data-label="Business">{l.vendor.businessName}<br /><small>{l.vendor.city}</small></td>
                <td data-label="Price" className="nowrap"><strong>{formatMoney(Number(l.rescuePrice))}</strong> <s>{formatMoney(Number(l.originalPrice))}</s><br /><small>{l.discountPercent}% off</small></td>
                <td data-label="Portions" className="nowrap"><strong>{l.quantityRemaining}</strong> of {l.quantityTotal} left</td>
                <td data-label="Pickup window">{formatDateTime(l.pickupStart)}<br /><small>until {formatDateTime(l.pickupEnd)}</small></td>
                <td data-label="Status"><span className={`status status--${l.status.toLowerCase()}`}>{STATUS_LABELS[l.status]}</span></td>
                <td className="table__actions">
                  {LIVE.includes(l.status) && (confirming === l.id ? (
                    <span className="inline-confirm">
                      <button type="button" className="btn btn--small" onClick={() => cancel(l)}>Yes, take down</button>
                      <button type="button" className="btn btn--small btn--ghost" onClick={() => setConfirming(null)}>Keep</button>
                    </span>
                  ) : (
                    <button type="button" className="btn btn--small btn--ghost" onClick={() => setConfirming(l.id)}>Take down</button>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {phase === 'loading' && <p className="loading loading--inline" role="status">Loading…</p>}
        {phase === 'ready' && data?.content.length === 0 && <p className="empty empty--inline">{debounced || status ? 'No food matches that.' : 'Nothing has been listed yet.'}</p>}
      </div>
      <Pager data={data} onPage={setPage} />
    </section>
  )
}
