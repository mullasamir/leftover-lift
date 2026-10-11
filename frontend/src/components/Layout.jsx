import { Link, NavLink, Outlet } from 'react-router-dom'
import Brand from './Brand.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Layout() {
  const { user } = useAuth()

  return (
    <>
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
          <span>Leftover Lift. Good food belongs on a plate.</span>
          <span>Built with Spring Boot and React.</span>
        </div>
      </footer>
    </>
  )
}
