import { useState } from 'react'
import { api } from '../../api/client.js'
import Pager from '../../components/Pager.jsx'
import { useDebounced, useFetch } from '../../lib/hooks.js'
import { formatDate } from '../../lib/format.js'
import { formatMoney } from '../../lib/money.js'

const TYPE_LABEL = { BAKERY: 'Bakery', RESTAURANT: 'Restaurant', CAFE: 'Café', GROCERY: 'Grocery', HOTEL: 'Hotel', CATERER: 'Caterer', OTHER: 'Other' }

export default function VendorsTab({ notify, onChange }) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)
  const debounced = useDebounced(query)
  const { phase, data, error, setData } = useFetch(
    () => api.admin.vendors({ q: debounced.trim(), page, size: 10 }),
    [debounced, page],
  )

  async function toggle(vendor) {
    try {
      await api.admin.setEnabled(vendor.userId, !vendor.enabled)
      setData((d) => ({ ...d, content: d.content.map((v) => (v.id === vendor.id ? { ...v, enabled: !vendor.enabled } : v)) }))
      notify(`${vendor.businessName} is now ${vendor.enabled ? 'disabled and cannot sign in' : 'enabled again'}.`)
      onChange?.()
    } catch (err) {
      notify(err.message)
    }
  }

  return (
    <section className="panel admin-section" aria-labelledby="vendors-title">
      <h2 id="vendors-title">Businesses</h2>
      <div className="controls controls--single">
        <div className="field search">
          <label className="visually-hidden" htmlFor="vendor-q">Search businesses</label>
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5" /><path d="M13 13l4 4" /></svg>
          <input id="vendor-q" type="search" placeholder="Search by business, city or owner email…" value={query} onChange={(e) => { setQuery(e.target.value); setPage(0) }} />
        </div>
      </div>

      {phase === 'error' && <p className="alert" role="alert">{error?.message}</p>}

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th scope="col">Business</th><th scope="col">Owner</th><th scope="col">Food</th><th scope="col">Rescued</th><th scope="col">Joined</th><th scope="col">Status</th><th scope="col"><span className="visually-hidden">Actions</span></th></tr>
          </thead>
          <tbody>
            {data?.content.map((v) => (
              <tr key={v.id} className={v.enabled ? '' : 'is-disabled'}>
                <td data-label="Business"><strong>{v.businessName}</strong><br /><small>{TYPE_LABEL[v.businessType] ?? v.businessType}, {v.city}</small></td>
                <td data-label="Owner">{v.ownerName}<br /><small>{v.ownerEmail}</small></td>
                <td data-label="Food" className="nowrap"><strong>{v.liveListings}</strong> live<br /><small>{v.listingsPosted} posted</small></td>
                <td data-label="Rescued" className="nowrap"><strong>{v.portionsRescued}</strong> portions<br /><small>{formatMoney(Number(v.revenueRecovered))}</small></td>
                <td data-label="Joined" className="nowrap">{formatDate(v.createdAt)}</td>
                <td data-label="Status"><span className={`status ${v.enabled ? 'status--available' : 'status--cancelled'}`}>{v.enabled ? 'Active' : 'Disabled'}</span></td>
                <td className="table__actions"><button type="button" className="btn btn--small btn--ghost" onClick={() => toggle(v)}>{v.enabled ? 'Disable' : 'Enable'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {phase === 'loading' && <p className="loading loading--inline" role="status">Loading…</p>}
        {phase === 'ready' && data?.content.length === 0 && <p className="empty empty--inline">{debounced ? 'No business matches that search.' : 'No businesses have joined yet.'}</p>}
      </div>
      <Pager data={data} onPage={setPage} />
    </section>
  )
}
