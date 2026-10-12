import { prefersReducedMotion } from './scrollBus.js'

const COLORS = ['#ff9f1c', '#1f9d77', '#f59cb0', '#7a4e9c', '#ffc58b', '#2b2358']

/** A small burst of crumbs and leaves from a point on screen. Purely decorative. */
export function burst(x, y) {
  if (prefersReducedMotion()) return
  for (let i = 0; i < 18; i++) {
    const el = document.createElement('span')
    const size = 6 + Math.random() * 9
    Object.assign(el.style, {
      position: 'fixed', left: `${x}px`, top: `${y}px`, width: `${size}px`, height: `${size * (Math.random() > 0.5 ? 1 : 0.55)}px`,
      background: COLORS[i % COLORS.length], borderRadius: i % 3 === 0 ? '50%' : '45% 55% 50% 50%',
      pointerEvents: 'none', zIndex: '9999',
    })
    document.body.appendChild(el)

    const angle = Math.random() * Math.PI * 2
    const dist = 60 + Math.random() * 100
    const dx = Math.cos(angle) * dist
    const dy = Math.sin(angle) * dist - 50
    el.animate(
      [
        { transform: 'translate(-50%, -50%) scale(1) rotate(0deg)', opacity: 1 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy + 110}px)) scale(0.4) rotate(${Math.random() * 540}deg)`, opacity: 0 },
      ],
      { duration: 750 + Math.random() * 450, easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)' },
    ).onfinish = () => el.remove()
  }
}
