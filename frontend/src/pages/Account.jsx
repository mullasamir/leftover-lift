import { Link, useNavigate } from 'react-router-dom'
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
          <p style={{ color: 'var(--ink-soft)' }}>Post surplus food from your listings page.</p>
        </section>
      )}

      <div>
        <div className="account__actions">
          {user.role === 'CONSUMER' && <Link to="/rescues" className="btn">See my rescues</Link>}
          {user.role === 'VENDOR' && <Link to="/vendor" className="btn">Manage my listings</Link>}
          {user.role === 'ADMIN' && <Link to="/admin" className="btn">Open admin dashboard</Link>}
          <button className="btn btn--ghost" onClick={async () => { await logout(); navigate('/') }}>Sign out</button>
        </div>
      </div>
    </div>
  )
}
