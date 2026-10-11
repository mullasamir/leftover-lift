import { useEffect, useState } from 'react'

export function useCountdown(closesAt) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  return Math.max(0, closesAt - now)
}

export function formatRemaining(ms) {
  if (ms <= 0) return 'Closed'
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m`
  return `${totalSeconds}s`
}

// Spoken version for screen readers, e.g. "1 hour 12 minutes left"
export function spokenRemaining(ms) {
  if (ms <= 0) return 'Closed'
  const totalMinutes = Math.ceil(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  const parts = []
  if (hours) parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`)
  if (minutes) parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`)
  return `${parts.join(' ')} left`
}
