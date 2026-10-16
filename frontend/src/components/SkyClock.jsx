import { useEffect, useRef } from 'react'
import { prefersReducedMotion, skyProgress, subscribe } from '../lib/scrollBus.js'

const START = 16 * 60 + 30 // 4:30 pm
const END = 20 * 60 + 30 // 8:30 pm

const MOODS = [
  [0.25, 'Kitchens are still serving'],
  [0.5, 'Shelves are thinning out'],
  [0.75, 'Closing time is close'],
  [1.01, 'Golden hour: last pickups'],
]

function formatTime(totalMinutes) {
  const h24 = Math.floor(totalMinutes / 60) % 24
  const m = Math.floor(totalMinutes % 60)
  const h = ((h24 + 11) % 12) + 1
  return `${h}:${String(m).padStart(2, '0')} ${h24 >= 12 ? 'pm' : 'am'}`
}

/** A small clock that moves with the sky: the further you scroll, the later it gets. */
export default function SkyClock() {
  const timeRef = useRef(null)
  const moodRef = useRef(null)
  const reduce = prefersReducedMotion()

  useEffect(() => {
    if (reduce) return undefined
    return subscribe(() => {
      const p = skyProgress()
      if (timeRef.current) timeRef.current.textContent = formatTime(START + p * (END - START))
      if (moodRef.current) moodRef.current.textContent = MOODS.find(([limit]) => p < limit)[1]
    })
  }, [reduce])

  if (reduce) return null
  return (
    <div className="sky-clock" aria-hidden="true">
      <span className="sky-clock__dot" />
      <strong ref={timeRef}>4:30 pm</strong>
      <span className="sky-clock__mood" ref={moodRef}>Kitchens are still serving</span>
    </div>
  )
}
