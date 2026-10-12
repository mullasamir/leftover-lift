import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../lib/scrollBus.js'

/**
 * Counts up to `value`. With `whenVisible` it waits until scrolled into view.
 * The animated text is hidden from screen readers; they get the final value once.
 */
export default function AnimatedNumber({ value, decimals = 0, prefix = '', suffix = '', duration = 1100, whenVisible = false }) {
  const textRef = useRef(null)
  const shown = useRef(0)
  const [armed, setArmed] = useState(!whenVisible)
  const format = (n) => prefix + n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix

  useEffect(() => {
    if (armed) return undefined
    const el = textRef.current
    if (!el || !('IntersectionObserver' in window)) {
      setArmed(true)
      return undefined
    }
    const io = new IntersectionObserver(([entry]) => entry.isIntersecting && (setArmed(true), io.disconnect()), { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [armed])

  useEffect(() => {
    if (!armed) return undefined
    const el = textRef.current
    if (prefersReducedMotion()) {
      shown.current = value
      if (el) el.textContent = format(value)
      return undefined
    }
    const from = shown.current
    const start = performance.now()
    let frame
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      shown.current = from + (value - from) * eased
      if (el) el.textContent = format(shown.current)
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [armed, value, decimals, prefix, suffix, duration])

  return (
    <>
      <span ref={textRef} aria-hidden="true">{format(whenVisible && !armed ? 0 : value)}</span>
      <span className="visually-hidden">{format(value)}</span>
    </>
  )
}
