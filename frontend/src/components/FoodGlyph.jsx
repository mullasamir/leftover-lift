// Small icons, one per food category, used where a full illustration would be too big.
const ink = '#14342B'

const glyphs = {
  bakery: (
    <>
      <path d="M5 21c0-7 5-12 13-12s13 5 13 12c0 3-2 4-4 4H9c-2 0-4-1-4-4Z" fill="#E59A3C" stroke={ink} strokeWidth="2" strokeLinejoin="round" />
      <path d="M13 14l2 5M19 13l1 6M25 14l-1 5" stroke="#FFE2A8" strokeWidth="2.4" strokeLinecap="round" />
    </>
  ),
  meals: (
    <>
      <path d="M4 16h28c0 8-6 13-14 13S4 24 4 16Z" fill="#FFFBF2" stroke={ink} strokeWidth="2" strokeLinejoin="round" />
      <path d="M7 16c2-5 7-7 11-7s9 2 11 7Z" fill="#E8872A" stroke={ink} strokeWidth="2" strokeLinejoin="round" />
    </>
  ),
  cafe: (
    <>
      <path d="M6 12h18v9c0 4-3 7-9 7s-9-3-9-7v-9Z" fill="#FFFBF2" stroke={ink} strokeWidth="2" strokeLinejoin="round" />
      <path d="M24 15h3c3 0 3 7 0 7h-3" fill="none" stroke={ink} strokeWidth="2" strokeLinecap="round" />
      <path d="M11 5c-1 2 1 3 0 5M17 5c-1 2 1 3 0 5" stroke={ink} strokeWidth="2" strokeLinecap="round" fill="none" />
    </>
  ),
  grocery: (
    <>
      <circle cx="18" cy="21" r="10" fill="#E4442F" stroke={ink} strokeWidth="2" />
      <path d="M18 11c0-4 2-6 6-7-1 4-3 6-6 7Z" fill="#1F9D77" stroke={ink} strokeWidth="2" strokeLinejoin="round" />
    </>
  ),
}

export default function FoodGlyph({ category }) {
  return (
    <svg viewBox="0 0 36 36" aria-hidden="true" focusable="false">
      {glyphs[category] ?? glyphs.bakery}
    </svg>
  )
}
