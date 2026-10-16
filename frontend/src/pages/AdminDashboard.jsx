import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'

const ROLE_LABEL = { CONSUMER: 'Customer', VENDOR: 'Business', DRIVER: 'Driver', ADMIN: 'Admin' }
const PAGE_SIZE = 10

function useDebounced(value, delay = 350) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

const date = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

const TOPIC_LABEL = { GENERAL: 'Hello', BUSINESS: 'Business', PROBLEM: 'Problem', FEEDBACK: 'Feedback' }

function Inbox({ onChange }) {
  const [unreadOnly, setUnreadOnly] = useState(true)
  const [data, setData] = useState(null)
  const [phase, setPhase] = useState('loading')

  const load = useCallback(() => {
    let cancelled = false
    setPhase('loading')
    api.admin
      .messages({ handled: unreadOnly ? false : undefined, size: 20 })
      .then((res) => !cancelled && (setData(res), setPhase('ready')))
      .catch(() => !cancelled && setPhase('error'))
    return () => {
      cancelled = true
    }
  }, [unreadOnly])

  useEffect(() => load(), [load])

  async function toggle(message) {
    const updated = await api.admin.setHandled(message.id, !message.handled).catch(() => null)
    if (!updated) return
    setData((d) => ({ ...d, content: unreadOnly && updated.handled ? d.content.filter((m) => m.id !== updated.id) : d.content.map((m) => (m.id === updated.id ? updated : m)) }))
    onChange?.()
  }

  return (
    <section className="panel inbox" aria-labelledby="inbox-title">
      <div className="inbox__head">
        <h2 id="inbox-title">Inbox</h2>
        <div className="chips" role="group" aria-label="Which messages">
          <button type="button" className="chip" aria-pressed={unreadOnly} onClick={() => setUnreadOnly(true)}>Needs a reply</button>
          <button type="button" className="chip" aria-pressed={!unreadOnly} onClick={() => setUnreadOnly(false)}>All messages</button>
        </div>
      </div>

      {phase === 'loading' && <p className="loading loading--inline" role="status">Loading…</p>}
      {phase === 'error' && <p className="alert" role="alert">We couldn’t load the inbox.</p>}
      {phase === 'ready' && data?.content.length === 0 && <p className="empty empty--inline">{unreadOnly ? 'All caught up. No messages waiting.' : 'No messages yet.'}</p>}

      <ul className="inbox__list">
        {data?.content.map((m) => (
          <li key={m.id} className={m.handled ? 'is-done' : ''}>
            <div className="inbox__meta">
              <span className="role">{TOPIC_LABEL[m.topic] ?? m.topic}</span>
              <strong>{m.name}</strong>
              <a href={`mailto:${m.email}`}>{m.email}</a>
              <time dateTime={m.createdAt}>{date.format(new Date(m.createdAt))}</time>
            </div>
            <p>{m.message}</p>
            <button type="button" className="btn btn--small btn--ghost" onClick={() => toggle(m)}>{m.handled ? 'Mark as unread' : 'Mark as handled'}</button>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function AdminDashboard() {
  const { user: me } = useAuth()
  const [stats, setStats] = useState(null)
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('')
  const [page, setPage] = useState(0)
  const [data, setData] = useState(null)
  const [phase, setPhase] = useState('loading')
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState('')
  const debounced = useDebounced(query)

  useEffect(() => {
    api.admin.stats().then(setStats).catch(() => {})
  }, [])

  // Any filter change goes back to the first page.
  useEffect(() => setPage(0), [debounced, role])

  const load = useCallback(() => {
    let cancelled = false
    setPhase('loading')
    api.admin
      .users({ q: debounced.trim(), role, page, size: PAGE_SIZE })
      .then((res) => !cancelled && (setData(res), setPhase('ready')))
      .catch((err) => !cancelled && (setError(err), setPhase('error')))
    return () => {
      cancelled = true
    }
  }, [debounced, role, page])

  useEffect(() => load(), [load])

  async function toggle(target) {
    try {
      const updated = await api.admin.setEnabled(target.id, !target.enabled)
      setData((d) => ({ ...d, content: d.content.map((u) => (u.id === updated.id ? updated : u)) }))
      setNotice(`${updated.fullName} is now ${updated.enabled ? 'enabled' : 'disabled'}.`)
    } catch (err) {
      setNotice(err.message)
    }
    setTimeout(() => setNotice(''), 4000)
  }

  const live = stats?.listingsByStatus?.AVAILABLE ?? 0

  return (
    <div className="page dash">
      <div className="panel dash__head">
        <div>
          <h1>Admin dashboard</h1>
          <p className="hand">keeping the platform healthy</p>
        </div>
      </div>

      {stats && (
        <div className="stats stats--admin">
          <p className="stat"><strong>{stats.usersByRole.CONSUMER ?? 0}</strong><span>customers</span></p>
          <p className="stat"><strong>{stats.usersByRole.VENDOR ?? 0}</strong><span>businesses</span></p>
          <p className="stat"><strong>{live}</strong><span>live listings</span></p>
          <p className="stat"><strong>{stats.portionsRescued ?? 0}</strong><span>portions rescued</span></p>
          <p className="stat"><strong>{stats.unreadMessages ?? 0}</strong><span>messages to answer</span></p>
        </div>
      )}

      <section className="panel admin-users" aria-labelledby="users-title">
        <h2 id="users-title">People</h2>
        <div className="controls">
          <div className="field search">
            <label className="visually-hidden" htmlFor="user-q">Search by name or email</label>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5" /><path d="M13 13l4 4" /></svg>
            <input id="user-q" type="search" placeholder="Search by name or email…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <label className="sort">
            Account type
            <select value={role} onChange={(e) => setRole(e.target.value)}>
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
                  <td data-label="Joined">{u.createdAt ? date.format(new Date(u.createdAt)) : ''}</td>
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

        {data && data.totalPages > 1 && (
          <nav className="pager" aria-label="Pages of people">
            <button type="button" className="btn btn--small btn--ghost" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</button>
            <span>Page {data.page + 1} of {data.totalPages}</span>
            <button type="button" className="btn btn--small btn--ghost" disabled={data.last} onClick={() => setPage((p) => p + 1)}>Next</button>
          </nav>
        )}
      </section>

      <Inbox onChange={() => api.admin.stats().then(setStats).catch(() => {})} />

      {notice && <p className="toast" role="status">{notice}</p>}
    </div>
  )
}
