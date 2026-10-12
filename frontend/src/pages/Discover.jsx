import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import FoodCard from '../components/FoodCard.jsx'
import Reveal from '../components/Reveal.jsx'
import { CATEGORIES, discountPercent, sampleListings } from '../data/mockListings.js'
import { useAuth } from '../context/AuthContext.jsx'

const SORTS = {
  closing: { label: 'Closing soonest', fn: (a, b) => a.closesAt - b.closesAt },
  nearest: { label: 'Nearest', fn: (a, b) => parseFloat(a.distance) - parseFloat(b.distance) },
  cheapest: { label: 'Lowest price', fn: (a, b) => a.price - b.price },
  deal: { label: 'Biggest saving', fn: (a, b) => discountPercent(b) - discountPercent(a) },
}

const SearchIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
    <circle cx="8.5" cy="8.5" r="5.5" /><path d="M13 13l4 4" />
  </svg>
)

export default function Discover() {
  const [params] = useSearchParams()
  const [category, setCategory] = useState(CATEGORIES.some((c) => c.id === params.get('cat')) ? params.get('cat') : 'all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('closing')
  const [notice, setNotice] = useState('')
  const timer = useRef(null)
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => () => clearTimeout(timer.current), [])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return sampleListings
      .filter((l) => category === 'all' || l.category === category)
      .filter((l) => !q || [l.vendor, l.title, l.detail, ...l.tags].join(' ').toLowerCase().includes(q))
      .sort(SORTS[sort].fn)
  }, [category, query, sort])

  function handleRescue(listing) {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } })
      return
    }
    setNotice(`Reservations open in the next update. “${listing.title}” will be yours to claim then.`)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setNotice(''), 4500)
  }

  return (
    <div className="page discover">
      <div className="panel discover__panel">
        <div>
          <h1>Rescue something good</h1>
          <p className="hand">sample listings until businesses start posting</p>
        </div>

        <div className="controls">
          <div className="field search">
            <label className="visually-hidden" htmlFor="q">Search food or places</label>
            <SearchIcon />
            <input id="q" type="search" placeholder="Search bread, curry, a bakery…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <label className="sort">
            Sort by
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              {Object.entries(SORTS).map(([id, s]) => <option key={id} value={id}>{s.label}</option>)}
            </select>
          </label>
        </div>

        <div className="chips" role="group" aria-label="Filter by type of food">
          {CATEGORIES.map((c) => (
            <button key={c.id} type="button" className="chip" aria-pressed={category === c.id} onClick={() => setCategory(c.id)}>{c.label}</button>
          ))}
        </div>
        <p className="discover__count" role="status">{visible.length === 1 ? '1 rescue' : `${visible.length} rescues`} nearby</p>
      </div>

      {visible.length === 0 ? (
        <div className="empty">
          <h2 style={{ fontSize: 'var(--step-2)' }}>Nothing matches yet</h2>
          <p>Try a different word, or clear the filter. Kitchens post more as they close up this evening.</p>
          <button type="button" className="btn btn--small" onClick={() => { setCategory('all'); setQuery('') }}>Clear filters</button>
        </div>
      ) : (
        <div className="listing-grid">
          {visible.map((l, i) => (
            <Reveal key={l.id} variant="deal" delay={(i % 3) * 80}><FoodCard listing={l} onRescue={handleRescue} /></Reveal>
          ))}
        </div>
      )}

      {notice && <p className="toast" role="status">{notice}</p>}
    </div>
  )
}
