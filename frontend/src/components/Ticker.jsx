import FoodGlyph from './FoodGlyph.jsx'

const ITEMS = [
  { category: 'bakery', text: 'A mixed pastry bag found a home before closing' },
  { category: 'meals', text: 'Two portions of paneer curry were collected warm' },
  { category: 'grocery', text: 'A surprise veg box left with a happy cook' },
  { category: 'cafe', text: 'The last sandwich of the day was rescued' },
  { category: 'bakery', text: 'Two sourdough loaves are on their way to toast' },
  { category: 'meals', text: 'Dinner for two was claimed in under a minute' },
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

/** Sample activity strip. The second group makes the loop seamless and is hidden from assistive tech. */
export default function Ticker() {
  return (
    <div className="ticker" role="region" aria-label="Sample rescue activity">
      <div className="ticker__track">
        <Group />
        <Group hidden />
      </div>
    </div>
  )
}
