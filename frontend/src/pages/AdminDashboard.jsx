import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api/client.js'
import { useFetch } from '../lib/hooks.js'
import FoodTab from './admin/FoodTab.jsx'
import InboxTab from './admin/InboxTab.jsx'
import Overview from './admin/Overview.jsx'
import PeopleTab from './admin/PeopleTab.jsx'
import PickupsTab from './admin/PickupsTab.jsx'
import VendorsTab from './admin/VendorsTab.jsx'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'businesses', label: 'Businesses' },
  { id: 'food', label: 'Food' },
  { id: 'pickups', label: 'Pickups' },
  { id: 'people', label: 'People' },
  { id: 'inbox', label: 'Inbox' },
]

/** The owner's control centre: everything on the platform, in one place, with the power to act on it. */
export default function AdminDashboard() {
  const [params, setParams] = useSearchParams()
  const tab = TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'overview'
  const view = params.get('view') ?? undefined
  const stats = useFetch(() => api.admin.stats(), [])
  const [notice, setNotice] = useState('')
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  function notify(message) {
    setNotice(message)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setNotice(''), 4500)
  }

  const go = (id, extra = {}) => setParams({ tab: id, ...extra })
  const refreshTotals = () => stats.reload()
  const unread = stats.data?.unreadMessages ?? 0

  return (
    <div className="page dash">
      <div className="panel dash__head">
        <div>
          <h1>Owner dashboard</h1>
          <p className="hand">everything on Leftover Lift, in one place</p>
        </div>
      </div>

      <nav className="tabs" aria-label="Dashboard sections">
        {TABS.map((t) => (
          <button key={t.id} type="button" className="tab" aria-current={tab === t.id ? 'page' : undefined} onClick={() => go(t.id)}>
            {t.label}
            {t.id === 'inbox' && unread > 0 && <span className="tab__badge" aria-label={`${unread} unanswered`}>{unread}</span>}
          </button>
        ))}
      </nav>

      {tab === 'overview' && (
        stats.data ? <Overview stats={stats.data} onJump={go} /> : stats.phase === 'error'
          ? <p className="alert" role="alert">{stats.error?.message}</p>
          : <p className="loading" role="status">Loading the numbers…</p>
      )}
      {tab === 'businesses' && <VendorsTab notify={notify} onChange={refreshTotals} />}
      {tab === 'food' && <FoodTab notify={notify} onChange={refreshTotals} />}
      {tab === 'pickups' && <PickupsTab key={view ?? 'live'} initialView={view} notify={notify} onChange={refreshTotals} />}
      {tab === 'people' && <PeopleTab notify={notify} onChange={refreshTotals} />}
      {tab === 'inbox' && <InboxTab onChange={refreshTotals} />}

      {notice && <p className="toast" role="status">{notice}</p>}
    </div>
  )
}
