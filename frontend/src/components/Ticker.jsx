import FoodGlyph from './FoodGlyph.jsx'

const ITEMS = [
  { category: 'bakery', text: 'Fresh bakes at fair prices' },
  { category: 'meals', text: 'Pay at the counter, nothing up front' },
  { category: 'grocery', text: 'Reserve up to three portions' },
  { category: 'cafe', text: 'Cancel any time before pickup ends' },
  { category: 'bakery', text: 'Collect within hours with a short code' },
  { category: 'meals', text: 'Every rescue keeps a meal out of the bin' },
]

function Group({ hidden }) {
  return (
    <div className="ticker__group" aria-hidden={hidden || undefined}>
      {ITEMS.map((item) => (
        <span className="ticker__item" key={item.text}>
          <span className="ticker__ico"><FoodGlyph category={item.category} /></span>
          {item.text}
        </span>
      ))}
    </div>
  )
}

/** A strip of what Leftover Lift offers. The second group makes the loop seamless and is hidden from assistive tech. */
export default function Ticker() {
  return (
    <div className="ticker" role="region" aria-label="What Leftover Lift offers">
      <div className="ticker__track">
        <Group />
        <Group hidden />
      </div>
    </div>
  )
}
