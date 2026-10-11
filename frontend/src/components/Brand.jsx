import { Link } from 'react-router-dom'

export function BrandMark() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="18" fill="#2f4a33" />
      <path d="M32 49C20 41 16 31 22 22c4-6 10-6 10-6s6 0 10 6c6 9 2 19-10 27Z" fill="#e8a93a" />
      <path d="M32 18v30" stroke="#2f4a33" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export default function Brand() {
  return (
    <Link to="/" className="brand" aria-label="Leftover Lift, home">
      <BrandMark />
      <span>Leftover Lift</span>
    </Link>
  )
}
