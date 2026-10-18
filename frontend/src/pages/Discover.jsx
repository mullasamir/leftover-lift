import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api/client.js'
import { CATEGORY_OPTIONS, toCardListing } from '../api/adapters.js'
import FoodCard from '../components/FoodCard.jsx'
import FoodGlyph from '../components/FoodGlyph.jsx'
import JoinButton from '../components/JoinButton.jsx'
import ReserveDialog from '../components/ReserveDialog.jsx'
import Reveal from '../components/Reveal.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { confetti } from '../lib/confetti.js'
import { useFavorites } from '../lib/favorites.js'
import { prefersReducedMotion } from '../lib/scrollBus.js'

const PAGE_SIZE = 12
const SOON_MS = 30 * 60 * 1000
const MOODS = [{ value: 'ALL', label: 'Everything' }, ...CATEGORY_OPTIONS, { value: 'SAVED', label: 'Saved' }]
const SORTS = {
  CLOSING: 'Closing soonest',
  DEAL: 'Biggest saving',
  CHEAPEST: 'Lowest price',
  NEWEST: 'Newly added',
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const SearchIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
    <circle cx="8.5" cy="8.5" r="5.5" /><path d="M13 13l4 4" />
  </svg>
)

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="chip__heart"><path d="M12 21s-7.500-4.600-7.500-10.200A4.300 4.300 0 0 1 12 8.300a4.300 4.300 0 0 1 7.500 2.500C19.500 16.400 12 21 12 21z" /></svg>
)

const AllIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="7" cy="7" r="3" fill="#ffce2e" stroke="#14342B" strokeWidth="1.600" /><circle cx="17" cy="7" r="3" fill="#ff5c8a" stroke="#14342B" strokeWidth="1.600" /><circle cx="7" cy="17" r="3" fill="#22b573" stroke="#14342B" strokeWidth="1.600" /><circle cx="17" cy="17" r="3" fill="#8ed8f8" stroke="#14342B" strokeWidth="1.600" /></svg>
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
  const [category, setCategory] = useState(MOODS.some((c) => c.value === initialCategory) ? initialCategory : 'ALL')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('CLOSING')
  const debouncedQuery = useDebounced(query)
  const favorites = useFavorites()

  const [items, setItems] = useState([])
  const [page, setPage] = useState(0)
  const [last, setLast] = useState(true)
  const [total, setTotal] = useState(0)
  const [phase, setPhase] = useState('loading') // loading | ready | error
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  const [notice, setNotice] = useState('')
  const [reserving, setReserving] = useState(null)
  const [glow, setGlow] = useState(null)
  const [spinning, setSpinning] = useState(false)
  const timer = useRef(null)
  const mounted = useRef(true)
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const saved = category === 'SAVED'

  const filters = useCallback(
    (pageNumber) => ({ q: debouncedQuery.trim(), category: category === 'ALL' || saved ? undefined : category, sort, page: pageNumber, size: PAGE_SIZE }),
    [debouncedQuery, category, saved, sort],
  )

  useEffect(() => {
    const controller = new AbortController()
    setPhase('loading')

    if (saved) {
      // Saved food is fetched by id. Anything that has ended or sold out simply drops off the list.
      Promise.allSettled(favorites.ids.map((id) => api.listings.get(id)))
        .then((results) => {
          if (controller.signal.aborted) return
          const found = results.filter((r) => r.status === 'fulfilled').map((r) => toCardListing(r.value)).sort((a, b) => a.closesAt - b.closesAt)
          setItems(found)
          setLast(true)
          setTotal(found.length)
          setPhase('ready')
        })
      return () => controller.abort()
    }

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
    // favorites.ids is read when the Saved view opens; hearting inside it should not refetch everything
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, saved, reloadKey])

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      clearTimeout(timer.current)
    }
  }, [])

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

  function flash(message) {
    setNotice(message)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setNotice(''), 4500)
  }

  function handleRescue(listing) {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } })
      return
    }
    if (user.role !== 'CONSUMER') {
      flash('Reserving food is for customer accounts. Sign in with one to rescue a meal.')
      return
    }
    setReserving(listing)
  }

  // "Surprise me": a quick spin across the cards that slows down and lands on one.
  async function surprise() {
    if (!items.length || spinning) return
    const target = items[Math.floor(Math.random() * items.length)]
    setSpinning(true)
    if (!prefersReducedMotion()) {
      const steps = 14
      for (let i = 0; i < steps; i++) {
        if (!mounted.current) return
        setGlow(i === steps - 1 ? target.id : items[Math.floor(Math.random() * items.length)].id)
        await sleep(70 + i * i * 2.4)
      }
    } else {
      setGlow(target.id)
    }
    if (!mounted.current) return
    document.getElementById(`card-${target.id}`)?.scrollIntoView({ block: 'center', behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
    confetti({ count: 45 })
    setSpinning(false)
    setTimeout(() => mounted.current && setGlow(null), 4000)
  }

  const now = Date.now()
  const closingSoon = items.filter((l) => l.closesAt > now && l.closesAt - now < SOON_MS).length
  const filtered = category !== 'ALL' || debouncedQuery.trim() !== ''

  return (
    <div className="page discover">
      <div className="panel discover__panel">
        <div className="discover__top">
          <div>
            <h1>Rescue something good</h1>
            <p className="hand">fresh from kitchens that are closing up</p>
          </div>
          <button type="button" className="btn btn--accent surprise-btn" onClick={surprise} disabled={spinning || phase !== 'ready' || items.length === 0}>
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.400" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.900 5.100L19 10l-5.100 1.900L12 17l-1.900-5.100L5 10l5.100-1.900zM19 16l.8 2.200L22 19l-2.200.8L19 22l-.8-2.200L16 19l2.200-.8z" /></svg>
            {spinning ? 'Choosing…' : 'Surprise me'}
          </button>
        </div>

        <div className="controls">
          <div className="field search">
            <label className="visually-hidden" htmlFor="q">Search food or places</label>
            <SearchIcon />
            <input id="q" type="search" placeholder="Search bread, curry, a bakery…" value={query} onChange={(e) => setQuery(e.target.value)} disabled={saved} />
          </div>
          <label className="sort">
            Sort by
            <select value={sort} onChange={(e) => setSort(e.target.value)} disabled={saved}>
              {Object.entries(SORTS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
        </div>

        <div className="chips chips--moods" role="group" aria-label="Filter by type of food">
          {MOODS.map((c) => (
            <button key={c.value} type="button" className="chip chip--icon" aria-pressed={category === c.value} onClick={() => setCategory(c.value)}>
              {c.value === 'SAVED' ? <HeartIcon /> : c.value === 'ALL' ? <span className="chip__glyph"><AllIcon /></span> : <span className="chip__glyph"><FoodGlyph category={c.value.toLowerCase()} /></span>}
              {c.label}
              {c.value === 'SAVED' && favorites.ids.length > 0 && <span className="chip__count">{favorites.ids.length}</span>}
            </button>
          ))}
        </div>

        <p className="discover__count" role="status">
          {phase === 'ready' ? `${total} ${total === 1 ? 'rescue' : 'rescues'} ${saved ? 'saved' : 'available'}` : phase === 'loading' ? 'Looking for food nearby…' : ''}
        </p>
        {phase === 'ready' && closingSoon > 0 && !saved && (
          <p className="hurry"><span className="hurry__dot" aria-hidden="true" />{closingSoon} {closingSoon === 1 ? 'rescue closes' : 'rescues close'} in the next 30 minutes</p>
        )}
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
          <h2 style={{ fontSize: 'var(--step-2)' }}>{saved ? 'Nothing saved yet' : filtered ? 'Nothing matches yet' : 'No food listed right now'}</h2>
          <p>
            {saved ? 'Tap the heart on any food card to keep it here for later.' : filtered ? 'Try a different word, or clear the filter.' : 'Kitchens post more as they close up this evening. Check back soon.'}
          </p>
          {(filtered || saved) && <button type="button" className="btn btn--small" onClick={() => { setCategory('ALL'); setQuery('') }}>See everything</button>}
          {!filtered && !saved && (!user || user.role === 'VENDOR') && <JoinButton role="VENDOR" className="btn btn--accent">Run a food business? Post the first listing</JoinButton>}
        </div>
      )}

      {phase === 'ready' && items.length > 0 && (
        <>
          <div className="listing-grid">
            {items.map((l, i) => (
              <Reveal key={l.id} id={`card-${l.id}`} variant="deal" delay={(i % 3) * 80} className={glow === l.id ? 'is-glowing' : ''}>
                <FoodCard listing={l} onRescue={handleRescue} favorite={favorites.has(l.id)} onToggleFavorite={() => favorites.toggle(l.id)} />
              </Reveal>
            ))}
          </div>
          {!last && (
            <div className="discover__more">
              <button type="button" className="btn btn--ghost" onClick={loadMore} disabled={loadingMore}>{loadingMore ? 'Loading…' : 'Show more'}</button>
            </div>
          )}
        </>
      )}

      {reserving && <ReserveDialog listing={reserving} onClose={() => setReserving(null)} onChanged={() => setReloadKey((k) => k + 1)} />}
      {notice && <p className="toast" role="status">{notice}</p>}
    </div>
  )
}
