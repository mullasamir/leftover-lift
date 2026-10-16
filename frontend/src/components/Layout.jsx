import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import Brand from './Brand.jsx'
import Sky from './Sky.jsx'
import { useAuth } from '../context/AuthContext.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

const PUBLIC_LINKS = [
  { to: '/discover', label: 'Find food' },
  { to: '/how-it-works', label: 'How it works' },
  { to: '/for-businesses', label: 'For businesses' },
  { to: '/about', label: 'About' },
]

function roleLink(user) {
  if (user?.role === 'CONSUMER') return { to: '/rescues', label: 'My rescues' }
  if (user?.role === 'VENDOR') return { to: '/vendor', label: 'My listings' }
  if (user?.role === 'ADMIN') return { to: '/admin', label: 'Admin' }
  return null
}

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const mine = roleLink(user)

  // Close the phone menu whenever the page changes, and on Escape.
  useEffect(() => setOpen(false), [location.pathname])
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <Sky />
      <ScrollToTop />
      <a href="#main" className="skip-link">Skip to content</a>
      <header className="site-header">
        <div className="page site-header__row">
          <Brand />

          <nav className="nav nav--links" aria-label="Main">
            {PUBLIC_LINKS.map((l) => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}
            {mine && <NavLink to={mine.to} className="nav__mine">{mine.label}</NavLink>}
          </nav>

          <div className="nav__end">
            {user ? (
              <NavLink to="/account" className="avatar" aria-label={`Your account, ${user.fullName}`}>
                {user.fullName.trim().charAt(0).toUpperCase()}
              </NavLink>
            ) : (
              <Link to="/login" className="btn btn--small btn--ghost">Sign in</Link>
            )}
            <button
              type="button" className="menu-btn" aria-expanded={open} aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((o) => !o)}
            >
              <span aria-hidden="true" className={`menu-btn__icon${open ? ' is-open' : ''}`}><i /><i /><i /></span>
            </button>
          </div>
        </div>

        {open && (
          <nav id="mobile-menu" className="mobile-menu" aria-label="Menu">
            {mine && <NavLink to={mine.to} className="mobile-menu__mine">{mine.label}</NavLink>}
            {PUBLIC_LINKS.map((l) => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}
            <NavLink to="/faq">FAQ</NavLink>
            <NavLink to="/contact">Contact</NavLink>
            {user ? (
              <button type="button" className="btn btn--ghost" onClick={() => logout()}>Sign out</button>
            ) : (
              <Link to="/register" className="btn btn--accent">Join Leftover Lift</Link>
            )}
          </nav>
        )}
      </header>

      <main id="main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="page footer__grid">
          <div className="footer__about">
            <Brand />
            <p>Good food belongs on a plate. Leftover Lift connects businesses that made a little too much with neighbours who would love it.</p>
          </div>
          <nav aria-label="Explore" className="footer__col">
            <h2>Explore</h2>
            <Link to="/discover">Find food</Link>
            <Link to="/how-it-works">How it works</Link>
            <Link to="/faq">FAQ</Link>
          </nav>
          <nav aria-label="Businesses" className="footer__col">
            <h2>Businesses</h2>
            <Link to="/for-businesses">Why join</Link>
            <Link to="/register?role=VENDOR">Create a business account</Link>
          </nav>
          <nav aria-label="Company" className="footer__col">
            <h2>Company</h2>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
          </nav>
        </div>
        <div className="page footer__base">
          <span>Made with care to keep good food out of the bin.</span>
          <span>Built with Spring Boot and React.</span>
        </div>
      </footer>
    </>
  )
}
