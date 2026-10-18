import { useState } from 'react'
import { api } from '../../api/client.js'
import Pager from '../../components/Pager.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { formatDate } from '../../lib/format.js'
import { useDebounced, useFetch } from '../../lib/hooks.js'

const ROLE_LABEL = { CONSUMER: 'Customer', VENDOR: 'Business', DRIVER: 'Driver', ADMIN: 'Admin' }

export default function PeopleTab({ notify, onChange }) {
  const { user: me } = useAuth()
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('')
  const [page, setPage] = useState(0)
  const debounced = useDebounced(query)
  const { phase, data, error, setData } = useFetch(
    () => api.admin.users({ q: debounced.trim(), role, page, size: 10 }),
    [debounced, role, page],
  )

  async function toggle(target) {
    try {
      const updated = await api.admin.setEnabled(target.id, !target.enabled)
      setData((d) => ({ ...d, content: d.content.map((u) => (u.id === updated.id ? updated : u)) }))
      notify(`${updated.fullName} is now ${updated.enabled ? 'enabled' : 'disabled'}.`)
      onChange?.()
    } catch (err) {
      notify(err.message)
    }
  }

  return (
    <section className="panel admin-section" aria-labelledby="people-title">
      <h2 id="people-title">Everyone</h2>
      <div className="controls">
        <div className="field search">
          <label className="visually-hidden" htmlFor="user-q">Search by name or email</label>
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5" /><path d="M13 13l4 4" /></svg>
          <input id="user-q" type="search" placeholder="Search by name or email…" value={query} onChange={(e) => { setQuery(e.target.value); setPage(0) }} />
        </div>
        <label className="sort">
          Account type
          <select value={role} onChange={(e) => { setRole(e.target.value); setPage(0) }}>
            <option value="">Everyone</option>
            {Object.entries(ROLE_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
      </div>

      {phase === 'error' && <p className="alert" role="alert">{error?.message}</p>}

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th scope="col">Name</th><th scope="col">Email</th><th scope="col">Type</th><th scope="col">Joined</th><th scope="col">Status</th><th scope="col"><span className="visually-hidden">Actions</span></th></tr>
          </thead>
          <tbody>
            {data?.content.map((u) => (
              <tr key={u.id} className={u.enabled ? '' : 'is-disabled'}>
                <td data-label="Name"><strong>{u.fullName}</strong></td>
                <td data-label="Email">{u.email}</td>
                <td data-label="Type"><span className={`role role--${u.role.toLowerCase()}`}>{ROLE_LABEL[u.role]}</span></td>
                <td data-label="Joined">{formatDate(u.createdAt)}</td>
                <td data-label="Status"><span className={`status ${u.enabled ? 'status--available' : 'status--cancelled'}`}>{u.enabled ? 'Active' : 'Disabled'}</span></td>
                <td className="table__actions">
                  <button type="button" className="btn btn--small btn--ghost" disabled={u.id === me.id} onClick={() => toggle(u)} title={u.id === me.id ? 'You cannot disable your own account' : undefined}>
                    {u.enabled ? 'Disable' : 'Enable'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {phase === 'loading' && <p className="loading loading--inline" role="status">Loading…</p>}
        {phase === 'ready' && data?.content.length === 0 && <p className="empty empty--inline">No one matches that search.</p>}
      </div>
      <Pager data={data} onPage={setPage} />
    </section>
  )
}
