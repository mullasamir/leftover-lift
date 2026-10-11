import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ListingTicket from '../components/ListingTicket.jsx'
import { CATEGORIES, sampleListings } from '../data/mockListings.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function Discover() {
  const [category, setCategory] = useState('all')
  const [notice, setNotice] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const visible = useMemo(
    () => sampleListings
      .filter((l) => category === 'all' || l.category === category)
      .sort((a, b) => a.closesAt - b.closesAt), // soonest to close first: that is what is most worth rescuing
    [category],
  )

  function handleRescue(listing) {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } })
      return
    }
    setNotice(`Reservations open in the next update. "${listing.title}" will be yours to claim then.`)
  }

  return (
    <div className="page discover">
      <div className="discover__head">
        <h1>Rescue something good</h1>
        <p className="discover__hand">sample listings until vendors start posting</p>
      </div>

      <div className="chips" role="group" aria-label="Filter by type of food">
        {CATEGORIES.map((c) => (
          <button key={c.id} type="button" className="chip" aria-pressed={category === c.id} onClick={() => setCategory(c.id)}>
            {c.label}
          </button>
        ))}
      </div>

      {notice && <p className="alert" role="status" style={{ borderColor: 'var(--fern)', background: '#e4ecd6', color: 'var(--moss-ink)' }}>{notice}</p>}

      {visible.length === 0 ? (
        <p className="empty">Nothing in this category right now. Check back this evening, when kitchens close up.</p>
      ) : (
        <div className="listing-grid">
          {visible.map((l) => <ListingTicket key={l.id} listing={l} onRescue={handleRescue} />)}
        </div>
      )}
    </div>
  )
}
