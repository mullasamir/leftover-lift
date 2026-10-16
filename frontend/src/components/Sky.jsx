import { useEffect } from 'react'
import { subscribe, poke, skyProgress, prefersReducedMotion } from '../lib/scrollBus.js'

const INK = '#14342B'
const S = `stroke="${INK}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"`

// Little market doodles. Static trusted SVG strings, like the food scenes.
const DOODLES = [
  { x: '1.2%', y: '24%', drift: '-170px', spin: '120deg', svg: `<circle cx="24" cy="27" r="16" fill="#ff5a3d" ${S}/><path d="M24 12c-3-5-8-6-11-5 3 4 6 6 11 5zm0 0c3-5 8-6 11-5-3 4-6 6-11 5z" fill="#22b573" ${S}/>` },
  { x: '95%', y: '38%', drift: '140px', spin: '-90deg', svg: `<circle cx="24" cy="24" r="17" fill="#ffe27a" ${S}/><circle cx="24" cy="24" r="12" fill="#fff3b0" ${S}/><path d="M24 12v24M12 24h24M15.500 15.500l17 17M32.500 15.500l-17 17" stroke="${INK}" stroke-width="1.800" stroke-linecap="round"/>` },
  { x: '1.8%', y: '66%', drift: '-110px', spin: '-60deg', svg: `<path d="M8 40C6 20 20 7 40 8c1 20-12 33-32 32z" fill="#22b573" ${S}/><path d="M10 38C20 28 27 21 34 14" fill="none" stroke="${INK}" stroke-width="2.200" stroke-linecap="round"/>` },
  { x: '95.2%', y: '72%', drift: '-150px', spin: '100deg', svg: `<path d="M14 14l22 4-10 26z" fill="#ff9a2e" ${S}/><path d="M16 14c-2-5 0-8 3-9M20 15c0-5 3-8 6-8M25 17c2-5 6-6 9-5" fill="none" stroke="#22b573" stroke-width="3" stroke-linecap="round"/>` },
  { x: '46%', y: '86%', drift: '-200px', spin: '70deg', svg: `<circle cx="24" cy="24" r="17" fill="#e8b36a" ${S}/><circle cx="17" cy="19" r="2.400" fill="${INK}"/><circle cx="29" cy="17" r="2.400" fill="${INK}"/><circle cx="25" cy="29" r="2.400" fill="${INK}"/><circle cx="15" cy="30" r="2.400" fill="${INK}"/>` },
]

export default function Sky() {
  useEffect(() => {
    const root = document.documentElement
    if (prefersReducedMotion()) {
      root.style.setProperty('--p', '0') // stay in the sunny morning
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
      <div className="sky__cloud sky__cloud--a" />
      <div className="sky__cloud sky__cloud--b" />
      <div className="sky__cloud sky__cloud--c" />
      <div className="sky__sun" />
      {DOODLES.map((d, i) => (
        <span key={i} className="sky__doodle" style={{ '--x': d.x, '--y': d.y, '--drift': d.drift, '--spin': d.spin }}>
          <svg viewBox="0 0 48 48" focusable="false" dangerouslySetInnerHTML={{ __html: d.svg }} />
        </span>
      ))}
    </div>
  )
}
