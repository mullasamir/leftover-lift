import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const ROLE_LABEL = { CONSUMER: 'Food rescuer', VENDOR: 'Business', DRIVER: 'Driver', ADMIN: 'Admin' }

export default function Account() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const v = user.vendor

  return (
    <div className="page account">
      <h1>Hi, {user.fullName.split(' ')[0]}</h1>

      <section className="card" aria-label="Your details">
        <dl>
          <dt>Name</dt><dd>{user.fullName}</dd>
          <dt>Email</dt><dd>{user.email}</dd>
          <dt>Account</dt><dd>{ROLE_LABEL[user.role] ?? user.role}</dd>
          {user.phone && <><dt>Phone</dt><dd>{user.phone}</dd></>}
        </dl>
      </section>

      {v && (
        <section className="card" aria-label="Your business">
          <h2 style={{ fontSize: 'var(--step-2)' }}>{v.businessName}</h2>
          <dl>
            <dt>Pickup</dt><dd>{v.address}, {v.city}, {v.state} {v.zipCode}</dd>
          </dl>
          <p style={{ color: 'var(--text-soft)' }}>Posting surplus food arrives in the next update.</p>
        </section>
      )}

      <div>
        <button className="btn btn--ghost" onClick={() => { logout(); navigate('/') }}>Sign out</button>
      </div>
    </div>
  )
}
