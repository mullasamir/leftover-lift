// Small hand-drawn style icons, one per food category. Stroke and fill only, no images to load.
const ink = '#1e2d21'

const glyphs = {
  bakery: (
    <>
      <path d="M5 21c0-7 5-12 13-12s13 5 13 12c0 3-2 4-4 4H9c-2 0-4-1-4-4Z" fill="#e8a93a" stroke={ink} strokeWidth="2" strokeLinejoin="round" />
      <path d="M13 14l2 5M19 13l1 6M25 14l-1 5" stroke={ink} strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  meals: (
    <>
      <path d="M4 16h28c0 8-6 13-14 13S4 24 4 16Z" fill="#f1e8d4" stroke={ink} strokeWidth="2" strokeLinejoin="round" />
      <path d="M11 11c-2-2 2-3 0-6M18 11c-2-2 2-3 0-6M25 11c-2-2 2-3 0-6" stroke={ink} strokeWidth="2" strokeLinecap="round" fill="none" />
    </>
  ),
  cafe: (
    <>
      <path d="M6 12h18v9c0 4-3 7-9 7s-9-3-9-7v-9Z" fill="#f1e8d4" stroke={ink} strokeWidth="2" strokeLinejoin="round" />
      <path d="M24 15h3c3 0 3 7 0 7h-3" fill="none" stroke={ink} strokeWidth="2" strokeLinecap="round" />
      <path d="M11 5c-1 2 1 3 0 5M17 5c-1 2 1 3 0 5" stroke={ink} strokeWidth="2" strokeLinecap="round" fill="none" />
    </>
  ),
  grocery: (
    <>
      <path d="M18 12c-8-1-13 5-11 12 1 4 5 6 11 6s10-2 11-6c2-7-3-13-11-12Z" fill="#6e8f4e" stroke={ink} strokeWidth="2" strokeLinejoin="round" />
      <path d="M18 12c0-4 2-7 6-8" fill="none" stroke={ink} strokeWidth="2" strokeLinecap="round" />
      <path d="M18 13v16" stroke={ink} strokeWidth="2" strokeLinecap="round" />
    </>
  ),
}

const backgrounds = { bakery: '#f3d9a4', meals: '#e9c9b8', cafe: '#d8d2b0', grocery: '#cfdcb7' }

export function glyphBackground(category) {
  return backgrounds[category] ?? '#e5d9bd'
}

export default function FoodGlyph({ category }) {
  return (
    <svg viewBox="0 0 36 36" aria-hidden="true">
      {glyphs[category] ?? glyphs.bakery}
    </svg>
  )
}
