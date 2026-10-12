// One shared scroll/resize listener for every scroll-driven effect, throttled to animation frames.
const subscribers = new Set()
let ticking = false
let started = false

function run() {
  ticking = false
  subscribers.forEach((fn) => fn())
}

function schedule() {
  if (!ticking) {
    ticking = true
    requestAnimationFrame(run)
  }
}

export function subscribe(fn) {
  if (!started) {
    started = true
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
  }
  subscribers.add(fn)
  fn()
  return () => subscribers.delete(fn)
}

/** Ask every subscriber to recompute, e.g. after the page height changed without a scroll. */
export function poke() {
  schedule()
}

/** 0 at the top of the page, 1 at the very bottom. */
export function skyProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight
  return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
}

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
