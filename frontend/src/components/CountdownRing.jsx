import { formatRemaining, spokenRemaining, useCountdown } from './useCountdown.js'

const RADIUS = 40
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const URGENT_MS = 30 * 60 * 1000

export default function CountdownRing({ closesAt, windowMinutes }) {
  const remaining = useCountdown(closesAt)
  const fraction = Math.min(1, remaining / (windowMinutes * 60 * 1000))
  const over = remaining === 0
  const urgent = !over && remaining <= URGENT_MS

  const className = ['ring', urgent && 'ring--urgent', over && 'ring--over'].filter(Boolean).join(' ')

  return (
    <div className={className} role="img" aria-label={spokenRemaining(remaining)}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle className="ring__track" cx="50" cy="50" r={RADIUS} fill="none" strokeWidth="10" />
        <circle
          className="ring__bar"
          cx="50" cy="50" r={RADIUS} fill="none" strokeWidth="10"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - fraction)}
        />
      </svg>
      <span className="ring__label" aria-hidden="true">
        <span>
          {formatRemaining(remaining)}
          {!over && <><br />left</>}
        </span>
      </span>
    </div>
  )
}
