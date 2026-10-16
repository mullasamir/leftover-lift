import { prefersReducedMotion } from './scrollBus.js'

const COLORS = ['#ffce2e', '#22b573', '#ff5c8a', '#ff5a3d', '#8ed8f8', '#ffffff']

/** A shower of confetti from the top of the screen. Purely decorative, and skipped for reduced motion. */
export function confetti({ count = 80 } = {}) {
  if (prefersReducedMotion()) return
  const width = window.innerWidth
  const height = window.innerHeight
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('span')
    const w = 7 + Math.random() * 7
    Object.assign(piece.style, {
      position: 'fixed', left: `${Math.random() * width}px`, top: '-24px', width: `${w}px`, height: `${w * (0.5 + Math.random())}px`,
      background: COLORS[i % COLORS.length], borderRadius: i % 4 === 0 ? '50%' : '2px', pointerEvents: 'none', zIndex: '9999', border: '1px solid rgba(20,52,43,.35)',
    })
    document.body.appendChild(piece)
    const sway = (Math.random() - 0.5) * 260
    piece
      .animate(
        [
          { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
          { transform: `translate(${sway}px, ${height + 60}px) rotate(${Math.random() * 900 - 450}deg)`, opacity: 1 },
        ],
        { duration: 1700 + Math.random() * 1600, delay: Math.random() * 500, easing: 'cubic-bezier(.3,.1,.5,1)', fill: 'forwards' },
      )
      .onfinish = () => piece.remove()
  }
}
