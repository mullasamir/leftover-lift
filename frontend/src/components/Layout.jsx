import { useEffect } from 'react'
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

export default function Layout() {
  const { user } = useAuth()

  return (
    <>
      <Sky />
      <ScrollToTop />
      <header className="site-header">
        <div className="page site-header__row">
          <Brand />
          <nav className="nav" aria-label="Main">
            <NavLink to="/discover">Find food</NavLink>
            {user ? (
              <NavLink to="/account">{user.fullName.split(' ')[0]}</NavLink>
            ) : (
              <Link to="/login" className="btn btn--small btn--ghost">Sign in</Link>
            )}
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="page">
          <Brand />
          <p>Good food belongs on a plate. Leftover Lift connects businesses with surplus food to neighbours who want it.</p>
          <div className="site-footer__row">
            <span>Sample listings shown until vendors start posting.</span>
            <span>Built with Spring Boot and React.</span>
          </div>
        </div>
      </footer>
    </>
  )
}
