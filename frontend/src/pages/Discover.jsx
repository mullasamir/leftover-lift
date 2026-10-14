import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api/client.js'
import { CATEGORY_OPTIONS, toCardListing } from '../api/adapters.js'
import FoodCard from '../components/FoodCard.jsx'
import Reveal from '../components/Reveal.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const PAGE_SIZE = 12
const CATEGORIES = [{ value: 'ALL', label: 'Everything' }, ...CATEGORY_OPTIONS]
const SORTS = {
  CLOSING: 'Closing soonest',
  DEAL: 'Biggest saving',
  CHEAPEST: 'Lowest price',
  NEWEST: 'Newly added',
}

const SearchIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
    <circle cx="8.5" cy="8.5" r="5.5" /><path d="M13 13l4 4" />
  </svg>
)

function useDebounced(value, delay = 350) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

export default function Discover() {
  const [params] = useSearchParams()
  const initialCategory = (params.get('cat') ?? '').toUpperCase()
  const [category, setCategory] = useState(CATEGORIES.some((c) => c.value === initialCategory) ? initialCategory : 'ALL')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('CLOSING')
  const debouncedQuery = useDebounced(query)

  const [items, setItems] = useState([])
  const [page, setPage] = useState(0)
  const [last, setLast] = useState(true)
  const [total, setTotal] = useState(0)
  const [phase, setPhase] = useState('loading') // loading | ready | error
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  const [notice, setNotice] = useState('')
  const timer = useRef(null)
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const filters = useCallback(
    (pageNumber) => ({ q: debouncedQuery.trim(), category: category === 'ALL' ? undefined : category, sort, page: pageNumber, size: PAGE_SIZE }),
    [debouncedQuery, category, sort],
  )

  useEffect(() => {
    const controller = new AbortController()
    setPhase('loading')
    api.listings
      .search(filters(0), controller.signal)
      .then((res) => {
        setItems(res.content.map(toCardListing))
        setPage(0)
        setLast(res.last)
        setTotal(res.totalElements)
        setPhase('ready')
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return
        setError(err)
        setPhase('error')
      })
    return () => controller.abort()
  }, [filters, reloadKey])

  useEffect(() => () => clearTimeout(timer.current), [])

  async function loadMore() {
    setLoadingMore(true)
    try {
      const res = await api.listings.search(filters(page + 1))
      setItems((prev) => [...prev, ...res.content.map(toCardListing)])
      setPage(page + 1)
      setLast(res.last)
      setTotal(res.totalElements)
    } catch (err) {
      setError(err)
    } finally {
      setLoadingMore(false)
    }
  }

  function handleRescue(listing) {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } })
      return
    }
    setNotice(`Reservations open in the next update. “${listing.title}” will be yours to claim then.`)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setNotice(''), 4500)
  }

  const filtered = category !== 'ALL' || debouncedQuery.trim() !== ''

  return (
    <div className="page discover">
      <div className="panel discover__panel">
        <div>
          <h1>Rescue something good</h1>
          <p className="hand">fresh from kitchens that are closing up</p>
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
              {Object.entries(SORTS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
        </div>

        <div className="chips" role="group" aria-label="Filter by type of food">
          {CATEGORIES.map((c) => (
            <button key={c.value} type="button" className="chip" aria-pressed={category === c.value} onClick={() => setCategory(c.value)}>{c.label}</button>
          ))}
        </div>
        <p className="discover__count" role="status">
          {phase === 'ready' ? `${total} ${total === 1 ? 'rescue' : 'rescues'} available` : phase === 'loading' ? 'Looking for food nearby…' : ''}
        </p>
      </div>

      {phase === 'loading' && (
        <div className="listing-grid" aria-hidden="true">
          {[0, 1, 2].map((i) => <div className="skeleton-card" key={i} />)}
        </div>
      )}

      {phase === 'error' && (
        <div className="empty" role="alert">
          <h2 style={{ fontSize: 'var(--step-2)' }}>We couldn’t load the food</h2>
          <p>{error?.message}</p>
          <button type="button" className="btn btn--small" onClick={() => setReloadKey((k) => k + 1)}>Try again</button>
        </div>
      )}

      {phase === 'ready' && items.length === 0 && (
        <div className="empty">
          <h2 style={{ fontSize: 'var(--step-2)' }}>{filtered ? 'Nothing matches yet' : 'No food listed right now'}</h2>
          <p>{filtered ? 'Try a different word, or clear the filter.' : 'Kitchens post more as they close up this evening. Check back soon.'}</p>
          {filtered && <button type="button" className="btn btn--small" onClick={() => { setCategory('ALL'); setQuery('') }}>Clear filters</button>}
        </div>
      )}

      {phase === 'ready' && items.length > 0 && (
        <>
          <div className="listing-grid">
            {items.map((l, i) => (
              <Reveal key={l.id} variant="deal" delay={(i % 3) * 80}><FoodCard listing={l} onRescue={handleRescue} /></Reveal>
            ))}
          </div>
          {!last && (
            <div className="discover__more">
              <button type="button" className="btn btn--ghost" onClick={loadMore} disabled={loadingMore}>{loadingMore ? 'Loading…' : 'Show more'}</button>
            </div>
          )}
        </>
      )}

      {notice && <p className="toast" role="status">{notice}</p>}
    </div>
  )
}
