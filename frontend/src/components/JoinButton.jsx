import { Link } from 'react-router-dom'
import { homeFor, useAuth } from '../context/AuthContext.jsx'

const SIGNED_IN_LABEL = {
  CONSUMER: 'Go to my rescues',
  VENDOR: 'Go to my listings',
  ADMIN: 'Open the admin dashboard',
}

/**
 * A "join" call to action that makes sense for whoever is looking: visitors are invited to sign up,
 * and signed-in people get a link to their own area instead of a sign-up page they no longer need.
 */
export default function JoinButton({ role = 'CONSUMER', className = 'btn', children }) {
  const { user } = useAuth()
  if (user) {
    return <Link to={homeFor(user)} className={className}>{SIGNED_IN_LABEL[user.role] ?? 'Go to my account'}</Link>
  }
  return <Link to={role === 'VENDOR' ? '/register?role=VENDOR' : '/register'} className={className}>{children}</Link>
}
