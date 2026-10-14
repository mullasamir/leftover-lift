import { formatMoney } from '../lib/money.js'
import { discountPercent, priceForDiscount, savings } from '../lib/pricing.js'

const QUICK_PICKS = [30, 40, 50, 60, 70]

/**
 * Shows the discount the moment both prices are filled in, so the vendor never has to do the maths.
 * The server calculates the real figure from the same two prices; this is a live preview of it.
 */
export default function DiscountMeter({ original, rescue, onPick }) {
  const hasOriginal = Number.isFinite(original) && original > 0
  const hasRescue = Number.isFinite(rescue) && rescue >= 0
  const ready = hasOriginal && hasRescue
  const tooHigh = ready && rescue >= original
  const percent = ready && !tooHigh ? discountPercent(original, rescue) : 0

  let message = 'Add both prices and we will work out the discount for you.'
  let tone = 'idle'
  if (tooHigh) {
    message = 'The rescue price must be lower than the usual price.'
    tone = 'bad'
  } else if (ready) {
    tone = percent >= 40 ? 'good' : 'ok'
    message =
      percent >= 90 ? 'Nearly free, ideal for food that has to go today.'
      : percent >= 40 ? 'A strong discount. Bigger savings are usually rescued faster.'
      : 'A small discount. Bigger savings are usually rescued faster.'
  }

  return (
    <div className={`meter meter--${tone}`}>
      <div className="meter__top">
        <div className="meter__number" aria-hidden="true">
          {ready && !tooHigh ? <>{percent}<span>% off</span></> : <span className="meter__dash">–</span>}
        </div>
        <div className="meter__copy">
          <p className="meter__headline" role="status" aria-live="polite">
            {ready && !tooHigh ? (
              <>
                <span className="visually-hidden">{percent}% off. </span>
                Customers save {formatMoney(savings(original, rescue))} on each portion.
              </>
            ) : message}
          </p>
          {ready && !tooHigh && <p className="meter__hint">{message}</p>}
        </div>
      </div>

      <div className="meter__track" aria-hidden="true"><span style={{ width: `${percent}%` }} /></div>

      <div className="meter__picks" role="group" aria-label="Set the rescue price from a discount">
        <span className="meter__picks-label">Or pick a discount:</span>
        {QUICK_PICKS.map((p) => (
          <button
            key={p}
            type="button"
            className="chip"
            disabled={!hasOriginal}
            aria-pressed={ready && !tooHigh && percent === p}
            onClick={() => onPick(priceForDiscount(original, p))}
          >
            {p}% off
          </button>
        ))}
      </div>
    </div>
  )
}
