import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function RequireAuth({ children }) {
  const { user, status } = useAuth()
  const location = useLocation()

  if (status === 'checking') return <p className="loading" role="status">Checking your session…</p>
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children
}
