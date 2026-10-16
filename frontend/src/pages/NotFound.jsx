import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="page content">
      <div className="panel panel--butter notfound">
        <svg viewBox="0 0 160 120" className="notfound__plate" aria-hidden="true">
          <ellipse cx="80" cy="104" rx="58" ry="8" fill="rgba(20,52,43,.14)" />
          <circle cx="80" cy="62" r="46" fill="#fffefa" stroke="#14342B" strokeWidth="3" />
          <circle cx="80" cy="62" r="31" fill="#fff3d6" stroke="#14342B" strokeWidth="3" />
          <path d="M66 58c0-3 3-5 6-5M88 58c0-3 3-5 6-5" stroke="#14342B" strokeWidth="3.500" strokeLinecap="round" fill="none" />
          <path d="M68 76c6-6 18-6 24 0" stroke="#14342B" strokeWidth="3.500" strokeLinecap="round" fill="none" />
        </svg>
        <h1>This plate is empty</h1>
        <p>We could not find that page. It may have been eaten already.</p>
        <div className="page-hero__actions">
          <Link to="/" className="btn">Back home</Link>
          <Link to="/discover" className="btn btn--accent">Find food</Link>
        </div>
      </div>
    </div>
  )
}
