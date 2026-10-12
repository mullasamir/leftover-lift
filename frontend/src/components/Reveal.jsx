import { useEffect, useRef, useState } from 'react'

/** Reveals its children the first time they scroll into view. Variants: rise, pop, deal. */
export default function Reveal({ as: Tag = 'div', variant = 'rise', delay = 0, className = '', children, ...rest }) {
  const ref = useRef(null)
  const [seen, setSeen] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    if (!('IntersectionObserver' in window)) {
      setSeen(true)
      return undefined
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true)
          io.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Tag ref={ref} className={`reveal reveal--${variant}${seen ? ' is-in' : ''} ${className}`.trim()} style={{ '--d': `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  )
}
