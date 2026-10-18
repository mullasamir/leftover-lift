import { useState } from 'react'
import { api } from '../../api/client.js'
import Pager from '../../components/Pager.jsx'
import { formatDateTime } from '../../lib/format.js'
import { useFetch } from '../../lib/hooks.js'
import { formatMoney } from '../../lib/money.js'

const VIEWS = {
  live: { label: 'Live pickups', status: 'RESERVED', empty: 'No one is waiting to collect anything right now.' },
  completed: { label: 'Completed pickups', status: 'COLLECTED', empty: 'No pickups have been completed yet.' },
  other: { label: 'Cancelled and missed', status: 'CANCELLED,EXPIRED', empty: 'Nothing has been cancelled or missed.' },
}
const OUTCOME = {
  CANCELLED: { label: 'Cancelled', className: 'status--cancelled' },
  EXPIRED: { label: 'Not collected', className: 'status--expired' },
}

export default function PickupsTab({ initialView = 'live', notify, onChange }) {
  const [view, setView] = useState(VIEWS[initialView] ? initialView : 'live')
  const [page, setPage] = useState(0)
  const [confirming, setConfirming] = useState(null) // { id, action }
  const { phase, data, error, setData } = useFetch(
    () => api.admin.reservations({ status: VIEWS[view].status, page, size: 10 }),
    [view, page],
  )

  async function act(pickup, action) {
    try {
      if (action === 'collect') await api.admin.collectReservation(pickup.id)
      else await api.admin.cancelReservation(pickup.id)
      setData((d) => ({ ...d, content: d.content.filter((p) => p.id !== pickup.id) })) // it no longer belongs in "live"
      notify(action === 'collect' ? `Marked ${pickup.customerName}'s pickup as collected.` : `Released ${pickup.customerName}'s reservation. The food is back on sale if time allows.`)
      onChange?.()
    } catch (err) {
      notify(err.message)
    }
    setConfirming(null)
  }

  const isLive = view === 'live'

  return (
    <section className="panel admin-section" aria-labelledby="pickups-title">
      <h2 id="pickups-title">Pickups</h2>
      <div className="seg seg--full" role="group" aria-label="Which pickups">
        {Object.entries(VIEWS).map(([id, v]) => (
          <button key={id} type="button" aria-pressed={view === id} onClick={() => { setView(id); setPage(0) }}>{v.label}</button>
        ))}
      </div>

      {phase === 'error' && <p className="alert" role="alert">{error?.message}</p>}

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Customer</th><th scope="col">Food</th><th scope="col">Business</th><th scope="col">Total</th>
              <th scope="col">{isLive ? 'Collect by' : view === 'completed' ? 'Collected' : 'Outcome'}</th>
              {isLive && <th scope="col">Code</th>}
              {isLive && <th scope="col"><span className="visually-hidden">Actions</span></th>}
            </tr>
          </thead>
          <tbody>
            {data?.content.map((p) => (
              <tr key={p.id}>
                <td data-label="Customer"><strong>{p.customerName}</strong><br /><small>{p.customerEmail}</small></td>
                <td data-label="Food">{p.quantity} × {p.listingTitle}</td>
                <td data-label="Business">{p.businessName}</td>
                <td data-label="Total" className="nowrap">{formatMoney(Number(p.totalPrice))}</td>
                <td data-label={isLive ? 'Collect by' : view === 'completed' ? 'Collected' : 'Outcome'}>
                  {isLive && formatDateTime(p.pickupEnd)}
                  {view === 'completed' && formatDateTime(p.collectedAt)}
                  {view === 'other' && <span className={`status ${OUTCOME[p.status]?.className ?? ''}`}>{OUTCOME[p.status]?.label ?? p.status}</span>}
                </td>
                {isLive && <td data-label="Code" className="nowrap"><code className="code-cell">{p.pickupCode}</code></td>}
                {isLive && (
                  <td className="table__actions">
                    {confirming?.id === p.id ? (
                      <span className="inline-confirm">
                        <button type="button" className="btn btn--small" onClick={() => act(p, confirming.action)}>Yes, {confirming.action === 'collect' ? 'mark collected' : 'cancel it'}</button>
                        <button type="button" className="btn btn--small btn--ghost" onClick={() => setConfirming(null)}>No</button>
                      </span>
                    ) : (
                      <span className="inline-confirm">
                        <button type="button" className="btn btn--small btn--accent" onClick={() => setConfirming({ id: p.id, action: 'collect' })}>Mark collected</button>
                        <button type="button" className="btn btn--small btn--ghost" onClick={() => setConfirming({ id: p.id, action: 'cancel' })}>Cancel</button>
                      </span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {phase === 'loading' && <p className="loading loading--inline" role="status">Loading…</p>}
        {phase === 'ready' && data?.content.length === 0 && <p className="empty empty--inline">{VIEWS[view].empty}</p>}
      </div>
      <Pager data={data} onPage={setPage} />
    </section>
  )
}
