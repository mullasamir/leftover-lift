import { useEffect, useRef } from 'react'
import CountdownRing from './CountdownRing.jsx'
import FoodScene from './FoodScene.jsx'
import { burst } from '../lib/burst.js'
import { prefersReducedMotion } from '../lib/scrollBus.js'
import { discountPercent } from '../data/mockListings.js'

const money = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' })

// Gentle 3D tilt that follows the pointer. Only on devices with a real hover pointer.
function useTilt(ref) {
  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion() || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined
    const move = (e) => {
      const r = el.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5
      const y = (e.clientY - r.top) / r.height - 0.5
      el.style.setProperty('--rx', `${(-y * 6).toFixed(2)}deg`)
      el.style.setProperty('--ry', `${(x * 8).toFixed(2)}deg`)
    }
    const reset = () => {
      el.style.setProperty('--rx', '0deg')
      el.style.setProperty('--ry', '0deg')
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', reset)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', reset)
    }
  }, [ref])
}

export default function FoodCard({ listing, onRescue }) {
  const ref = useRef(null)
  useTilt(ref)
  const { vendor, distance, title, detail, tags = [], left, price, originalPrice, pickup, closesAt, windowMinutes, category } = listing

  function handleRescue(e) {
    const r = e.currentTarget.getBoundingClientRect()
    burst(r.left + r.width / 2, r.top + r.height / 2)
    onRescue?.(listing)
  }

  return (
    <article className="fcard" data-cat={category} ref={ref}>
      <div className="fcard__art">
        <FoodScene category={category} />
        <span className="fcard__badge">{discountPercent(listing)}% off</span>
        {left != null && <span className={`fcard__left${left <= 2 ? ' fcard__left--low' : ''}`}>{left === 1 ? 'Last one' : `${left} left`}</span>}
      </div>

      <div className="fcard__body">
        <p className="fcard__vendor">{vendor}, {distance} away</p>
        <h3 className="fcard__title">{title}</h3>
        <p className="fcard__detail">{detail}</p>
        {tags.length > 0 && (
          <ul className="fcard__tags" aria-label="Dietary notes">
            {tags.map((t) => <li key={t}>{t}</li>)}
          </ul>
        )}
        <p className="fcard__pickup">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="10" cy="10" r="8" /><path d="M10 5v5l3 2" />
          </svg>
          {pickup}
        </p>
      </div>

      <div className="fcard__stub">
        <p className="fcard__price">
          <strong>{money.format(price)}</strong>
          <s><span className="visually-hidden">Usually </span>{money.format(originalPrice)}</s>
        </p>
        <CountdownRing closesAt={closesAt} windowMinutes={windowMinutes} />
        <button type="button" className="btn btn--accent btn--small" onClick={handleRescue}>Rescue this</button>
      </div>
    </article>
  )
}
