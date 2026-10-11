import CountdownRing from './CountdownRing.jsx'
import FoodGlyph, { glyphBackground } from './FoodGlyph.jsx'

const money = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' })

export default function ListingTicket({ listing, onRescue }) {
  const { vendor, distance, title, detail, price, originalPrice, pickup, closesAt, windowMinutes, category } = listing

  return (
    <article className="ticket">
      <div className="ticket__main">
        <div className="ticket__glyph" style={{ '--glyph-bg': glyphBackground(category) }}>
          <FoodGlyph category={category} />
        </div>
        <div className="ticket__body">
          <p className="ticket__vendor">{vendor}, {distance} away</p>
          <h3 className="ticket__title">{title}</h3>
          <p className="ticket__meta">{detail}</p>
          <p className="ticket__meta">{pickup}</p>
          <p className="ticket__price">
            <strong>{money.format(price)}</strong>
            <s>
              <span className="visually-hidden">Usually </span>
              {money.format(originalPrice)}
            </s>
          </p>
        </div>
      </div>
      <div className="ticket__stub">
        <CountdownRing closesAt={closesAt} windowMinutes={windowMinutes} />
        <button type="button" className="btn btn--small btn--marigold" onClick={() => onRescue?.(listing)}>
          Rescue this
        </button>
      </div>
    </article>
  )
}
