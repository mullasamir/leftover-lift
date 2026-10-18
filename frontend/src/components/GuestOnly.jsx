import { Navigate, useLocation } from 'react-router-dom'
import { homeFor, useAuth } from '../context/AuthContext.jsx'

/** Sign-in and sign-up are for visitors. Anyone already signed in is sent straight to their own home. */
export default function GuestOnly({ children }) {
  const { user, status } = useAuth()
  const location = useLocation()

  if (status === 'checking') return <p className="loading" role="status">One moment…</p>
  if (user) return <Navigate to={location.state?.from ?? homeFor(user)} replace />
  return children
}
