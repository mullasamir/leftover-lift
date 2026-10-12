import { useEffect } from 'react'
import { subscribe, poke, skyProgress, prefersReducedMotion } from '../lib/scrollBus.js'

// Deterministic "random" stars so the sky looks the same on every render.
const STARS = Array.from({ length: 46 }, (_, i) => {
  const r = (n) => {
    const x = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453
    return x - Math.floor(x)
  }
  return { left: r(1) * 100, top: r(2) * 72, size: 1.5 + r(3) * 2.5, delay: r(4) * 4 }
})

export default function Sky() {
  useEffect(() => {
    const root = document.documentElement
    if (prefersReducedMotion()) {
      root.style.setProperty('--p', '0') // stay in the afternoon
      return undefined
    }
    const unsubscribe = subscribe(() => root.style.setProperty('--p', skyProgress().toFixed(4)))
    // Pages change height without scrolling (route changes, images, accordions), so watch the body too.
    const observer = new ResizeObserver(poke)
    observer.observe(document.body)
    return () => {
      unsubscribe()
      observer.disconnect()
      root.style.removeProperty('--p')
    }
  }, [])

  return (
    <div className="sky" aria-hidden="true">
      <div className="sky__stars">
        {STARS.map((s, i) => (
          <span key={i} style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s` }} />
        ))}
      </div>
      <div className="sky__cloud sky__cloud--a" />
      <div className="sky__cloud sky__cloud--b" />
      <div className="sky__cloud sky__cloud--c" />
      <div className="sky__sun" />
      <div className="sky__moon" />
    </div>
  )
}
