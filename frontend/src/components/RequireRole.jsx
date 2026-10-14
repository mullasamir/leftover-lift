import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const AUDIENCE = { VENDOR: 'businesses', ADMIN: 'administrators', CONSUMER: 'customers' }

/** Sends signed-out visitors to sign in, and tells signed-in people kindly when an area is not for their account type. */
export default function RequireRole({ role, children }) {
  const { user, status } = useAuth()
  const location = useLocation()

  if (status === 'checking') return <p className="loading" role="status">Checking your session…</p>
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (user.role !== role) {
    return (
      <div className="page auth">
        <div className="auth__head">
          <h1>That area is for {AUDIENCE[role] ?? 'another account type'}</h1>
          <p>You are signed in as {user.fullName}. Head back to find food instead.</p>
        </div>
        <Link to="/discover" className="btn">Find food</Link>
      </div>
    )
  }
  return children
}
