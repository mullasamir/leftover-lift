import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client.js'
import { confetti } from '../lib/confetti.js'
import { formatMoney } from '../lib/money.js'

const MAX_PER_RESERVATION = 3

/**
 * The reserve sheet. A native <dialog> gives us focus trapping, Escape to close and a backdrop for free.
 * On a phone it slides up from the bottom; on a laptop it is a centred card.
 */
export default function ReserveDialog({ listing, onClose, onChanged }) {
  const ref = useRef(null)
  const [quantity, setQuantity] = useState(1)
  const [phase, setPhase] = useState('form') // form | busy | done
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const maxQuantity = Math.max(1, Math.min(MAX_PER_RESERVATION, listing.left ?? MAX_PER_RESERVATION))

  useEffect(() => {
    const dialog = ref.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  const close = () => ref.current?.close() // fires the dialog's own close event, which calls onClose

  async function confirm() {
    setPhase('busy')
    setError('')
    try {
      const reservation = await api.reservations.create(listing.id, quantity)
      setResult(reservation)
      setPhase('done')
      confetti({ count: 70 })
      onChanged?.()
    } catch (err) {
      setError(err.message)
      setPhase('form')
      if (err.status === 409) onChanged?.() // somebody else got there first: refresh the shelf behind us
    }
  }

  return (
    <dialog
      ref={ref}
      className="sheet"
      aria-labelledby="sheet-title"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && close()} // a click on the backdrop closes it
    >
      <div className="sheet__body">
        <button type="button" className="sheet__x" onClick={close} aria-label="Close">×</button>

        {phase !== 'done' ? (
          <>
            <div>
              <h2 id="sheet-title">Reserve {listing.title}</h2>
              <p className="sheet__sub">{listing.vendor}{listing.address ? `, ${listing.address}` : ''}</p>
            </div>

            <p className="sheet__row"><span>Pickup</span><strong>{listing.pickup}</strong></p>

            <div className="sheet__row">
              <span id="qty-label">Portions</span>
              <div className="stepper stepper--small" role="group" aria-labelledby="qty-label">
                <button type="button" className="stepper__btn" aria-label="One fewer portion" disabled={quantity <= 1} onClick={() => setQuantity((q) => q - 1)}>−</button>
                <output aria-live="polite">{quantity}</output>
                <button type="button" className="stepper__btn" aria-label="One more portion" disabled={quantity >= maxQuantity} onClick={() => setQuantity((q) => q + 1)}>+</button>
              </div>
            </div>

            <p className="sheet__row sheet__total"><span>Total to pay</span><strong>{formatMoney(listing.price * quantity)}</strong></p>
            <p className="sheet__note">You pay at the counter when you collect. There is nothing to pay now, and you can cancel any time before pickup ends.</p>

            {error && <p className="alert" role="alert">{error}</p>}

            <button type="button" className="btn btn--accent btn--block" onClick={confirm} disabled={phase === 'busy'}>
              {phase === 'busy' ? 'Reserving…' : 'Reserve now'}
            </button>
          </>
        ) : (
          <div className="sheet__done">
            <h2 id="sheet-title">You are all set</h2>
            <p>Show this code at {result.listing.businessName}.</p>
            <p className="code" aria-label={`Your pickup code is ${result.pickupCode.split('').join(' ')}`}>{result.pickupCode}</p>
            <p className="sheet__note">
              {result.quantity} × {result.listing.title}, {formatMoney(Number(result.totalPrice))} to pay at the counter.<br />
              {result.listing.address}, {result.listing.city}
            </p>
            <div className="sheet__actions">
              <Link to="/rescues" className="btn" onClick={close}>View my rescues</Link>
              <button type="button" className="btn btn--ghost" onClick={close}>Keep browsing</button>
            </div>
          </div>
        )}
      </div>
    </dialog>
  )
}
