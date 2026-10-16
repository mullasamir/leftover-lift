import { useState } from 'react'
import AnimatedNumber from './AnimatedNumber.jsx'
import FoodScene from './FoodScene.jsx'
import { SCENES } from './scenes.js'
import { confetti } from '../lib/confetti.js'
import { currencySymbol, formatMoney } from '../lib/money.js'

const MILESTONES = [10, 25, 50, 100, 250, 500, 1000]

/** A business's impact so far, with a one-tap summary to copy or share. */
export default function ImpactCard({ stats, businessName }) {
  const [message, setMessage] = useState('')
  const portions = stats.portionsRescued
  const kg = portions * 0.45
  const co2 = kg * 2.5
  const revenue = Number(stats.revenueRecovered)
  const next = MILESTONES.find((m) => m > portions) ?? null
  const previous = [...MILESTONES].reverse().find((m) => m <= portions) ?? 0

  const summary = `${businessName} has rescued ${portions} ${portions === 1 ? 'meal' : 'meals'} with Leftover Lift: about ${kg.toFixed(1)} kg of food kept out of the bin and roughly ${co2.toFixed(1)} kg of CO₂e avoided.`

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Our impact', text: summary })
      } else {
        await navigator.clipboard.writeText(summary)
        setMessage('Copied. Paste it anywhere you like.')
      }
      confetti({ count: 40 })
    } catch {
      setMessage('Select and copy: ' + summary)
    }
  }

  return (
    <section className="impact-card" aria-labelledby="impact-card-title">
      <div className="impact-card__main">
        <p className="impact-card__kicker" id="impact-card-title">Your impact so far</p>
        <p className="impact-card__big">
          <strong><AnimatedNumber value={portions} /></strong>
          <span>{portions === 1 ? 'meal rescued' : 'meals rescued'}</span>
        </p>

        <ul className="impact-card__list">
          <li><strong><AnimatedNumber value={kg} decimals={1} suffix=" kg" /></strong> of food kept out of the bin</li>
          <li><strong><AnimatedNumber value={co2} decimals={1} suffix=" kg" /></strong> of CO₂e avoided, roughly</li>
          <li><strong><AnimatedNumber value={revenue} prefix={currencySymbol} /></strong> recovered from {stats.handovers} {stats.handovers === 1 ? 'handover' : 'handovers'}</li>
        </ul>

        {next && (
          <div className="impact-card__goal">
            <div className="impact-card__bar" role="progressbar" aria-valuemin={previous} aria-valuemax={next} aria-valuenow={portions} aria-label={`Progress to ${next} meals`}>
              <span style={{ width: `${((portions - previous) / (next - previous)) * 100}%` }} />
            </div>
            <p>{next - portions} more {next - portions === 1 ? 'meal' : 'meals'} to reach {next}</p>
          </div>
        )}

        <button type="button" className="btn btn--accent" onClick={share}>Share your impact</button>
        {message && <p className="impact-card__msg" role="status">{message}</p>}
      </div>

      <div className="impact-card__art" aria-hidden="true">
        <FoodScene markup={SCENES.bag} />
        <span className="impact-card__sticker">{stats.listingsPosted} {stats.listingsPosted === 1 ? 'listing' : 'listings'} posted</span>
      </div>
      <span className="visually-hidden">{formatMoney(revenue)} recovered in total</span>
    </section>
  )
}
