import { useEffect, useRef, useState } from 'react'
import FoodCard from './FoodCard.jsx'
import FoodScene from './FoodScene.jsx'
import { closedScene, morningScene, SCENES } from './scenes.js'
import { prefersReducedMotion, subscribe } from '../lib/scrollBus.js'
import { sampleListings } from '../data/mockListings.js'

const STEPS = [
  { title: 'A baker lights the ovens', body: 'Every morning a bakery bakes for the customers it hopes to have. The day rushes by, and nobody can predict a rainy Tuesday.' },
  { title: 'Closing time, and the shelf is still full', body: 'The bread is perfectly good. Tomorrow it will be day-old, and most shops cannot sell it. This is the moment it usually goes in the bin.' },
  { title: 'The bakery posts a rescue', body: 'In under a minute: what is left, a fair price and a pickup window. A clock starts, and neighbours nearby are told.' },
  { title: 'Someone nearby collects it', body: 'The bread goes home for dinner, the baker earns a little back, and nothing is thrown away. Same food, a much better ending.' },
]

// Clock readings the story passes through, as [scroll progress, minutes after midnight].
// The first stretch fast-forwards through the working day so each step lines up with its time.
const KEYS = [[0, 6 * 60], [0.25, 17 * 60 + 30], [0.55, 18 * 60 + 45], [0.8, 19 * 60 + 10], [1, 19 * 60 + 40]]

function timeAt(t) {
  for (let i = 1; i < KEYS.length; i++) {
    if (t <= KEYS[i][0]) {
      const [t0, m0] = KEYS[i - 1]
      const [t1, m1] = KEYS[i]
      return m0 + (m1 - m0) * ((t - t0) / (t1 - t0))
    }
  }
  return KEYS[KEYS.length - 1][1]
}

function formatTime(totalMinutes) {
  const h24 = Math.floor(totalMinutes / 60)
  const m = Math.floor(totalMinutes % 60)
  const h = ((h24 + 11) % 12) + 1
  return `${h}:${String(m).padStart(2, '0')} ${h24 >= 12 ? 'pm' : 'am'}`
}

function stepFor(t) {
  if (t < 0.25) return 0
  if (t < 0.55) return 1
  if (t < 0.8) return 2
  return 3
}

/** A pinned story: scrolling through this section moves one loaf of bread through its day. */
export default function Journey() {
  const ref = useRef(null)
  const timeRef = useRef(null)
  const [step, setStep] = useState(0)
  const [staticMode, setStaticMode] = useState(false)

  useEffect(() => {
    // Pinned storytelling needs room: fall back to a plain list on short screens and for reduced motion.
    const decide = () => {
      const { innerWidth: w, innerHeight: h } = window
      setStaticMode(prefersReducedMotion() || h < 520 || (w < 960 && h < 700))
    }
    decide()
    window.addEventListener('resize', decide)
    return () => window.removeEventListener('resize', decide)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el || staticMode) return undefined
    return subscribe(() => {
      const rect = el.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      const t = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0
      el.style.setProperty('--jp', t.toFixed(4))
      if (timeRef.current) timeRef.current.textContent = formatTime(timeAt(t))
      const next = stepFor(t)
      setStep((prev) => (prev === next ? prev : next))
    })
  }, [staticMode])

  const active = staticMode ? -1 : step

  return (
    <section ref={ref} className={`journey${staticMode ? ' journey--static' : ''}`} aria-labelledby="journey-title">
      <div className="journey__stick">
        <div className="page journey__grid">
          <div className="panel journey__text">
            <h2 id="journey-title">One loaf, one long day</h2>
            <p className="hand journey__hint">keep scrolling, the day is moving</p>
            <p className="journey__time" ref={timeRef} aria-hidden="true">6:00 am</p>
            <div className="journey__bar" aria-hidden="true"><span /></div>
            <ol className="journey__steps">
              {STEPS.map((s, i) => (
                <li key={s.title} className={i === active ? 'is-active' : ''}>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </li>
              ))}
            </ol>
            <div className="journey__dots" aria-hidden="true">
              {STEPS.map((s, i) => <i key={s.title} className={i <= step ? 'is-on' : ''} />)}
            </div>
          </div>

          <div className="journey__visual" aria-hidden="true">
            <div className={`scene${active === 0 ? ' is-active' : ''}`}><FoodScene markup={morningScene} /></div>
            <div className={`scene${active === 1 ? ' is-active' : ''}`}><FoodScene markup={closedScene} /></div>
            <div className={`scene scene--card${active === 2 ? ' is-active' : ''}`}>
              <div className="fcard-wrap"><FoodCard listing={sampleListings[0]} /></div>
            </div>
            <div className={`scene${active === 3 ? ' is-active' : ''}`}><FoodScene markup={SCENES.bag} /></div>
          </div>
        </div>
      </div>
    </section>
  )
}
