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
  const portions = stats.portionsRescued ?? 0
  const kg = portions * 0.45
  const co2 = kg * 2.5
  const revenue = Number(stats.revenueRecovered ?? 0)
  const next = MILESTONES.find((m) => m > portions) ?? null
  const previous = [...MILESTONES].reverse().find((m) => m <= portions) ?? 0
  const progressPercent = next ? Math.min(100, Math.max(0, ((portions - previous) / (next - previous)) * 100)) : 100

  const summary = `${businessName} has rescued ${portions} ${portions === 1 ? 'meal' : 'meals'} with Leftover Lift: about ${kg.toFixed(1)} kg of food kept out of the bin and roughly ${co2.toFixed(1)} kg of CO₂e avoided.`

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title: `${businessName} Impact Report`, text: summary })
      } else {
        await navigator.clipboard.writeText(summary)
        setMessage('Copied impact summary! Paste anywhere you like.')
      }
      confetti({ count: 45 })
    } catch {
      setMessage('Select and copy: ' + summary)
    }
  }

  return (
    <section className="impact-card" aria-labelledby="impact-card-title">
      <div className="impact-card__glow" aria-hidden="true"></div>

      <div className="impact-card__main">
        <div className="impact-card__header">
          <span className="impact-card__badge">
            <span className="badge-pulse"></span>
            Verified ESG & Revenue Impact
          </span>
          <h2 className="impact-card__kicker" id="impact-card-title">
            {businessName}’s Sustainability Scorecard
          </h2>
        </div>

        {/* Hero Big Stat */}
        <div className="impact-card__hero">
          <div className="impact-card__big">
            <strong><AnimatedNumber value={portions} /></strong>
            <span>{portions === 1 ? 'Meal Rescued' : 'Total Meals Rescued'}</span>
          </div>
          <p className="impact-card__lead">
            Every rescued portion turns kitchen surplus into recovered revenue while protecting our environment.
          </p>
        </div>

        {/* 3-Pillar Bento Metric Cards */}
        <div className="impact-card__grid">
          <div className="impact-metric impact-metric--food">
            <div className="impact-metric__icon">🥗</div>
            <div className="impact-metric__data">
              <strong><AnimatedNumber value={kg} decimals={1} suffix=" kg" /></strong>
              <span>Food Kept Out of Landfills</span>
            </div>
          </div>

          <div className="impact-metric impact-metric--co2">
            <div className="impact-metric__icon">🌍</div>
            <div className="impact-metric__data">
              <strong><AnimatedNumber value={co2} decimals={1} suffix=" kg" /></strong>
              <span>CO₂e Greenhouse Gas Avoided</span>
            </div>
          </div>

          <div className="impact-metric impact-metric--money">
            <div className="impact-metric__icon">💰</div>
            <div className="impact-metric__data">
              <strong><AnimatedNumber value={revenue} prefix={currencySymbol} /></strong>
              <span>Revenue Recovered ({stats.handovers ?? 0} {stats.handovers === 1 ? 'handover' : 'handovers'})</span>
            </div>
          </div>
        </div>

        {/* Gamified Next Milestone Bar */}
        {next && (
          <div className="impact-card__goal">
            <div className="impact-card__goal-head">
              <span>🎯 Next Community Milestone: <strong>{next} Meals</strong></span>
              <span className="impact-card__goal-left">{next - portions} more to unlock</span>
            </div>
            <div className="impact-card__bar" role="progressbar" aria-valuemin={previous} aria-valuemax={next} aria-valuenow={portions} aria-label={`Progress to ${next} meals`}>
              <span style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        )}

        {/* Actions & Share */}
        <div className="impact-card__actions">
          <button type="button" className="btn btn--accent" onClick={share}>
            <span>Share Verified Impact</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
          </button>
          {message && <p className="impact-card__msg" role="status">{message}</p>}
        </div>
      </div>

      {/* Decorative Showcase Area */}
      <div className="impact-card__art" aria-hidden="true">
        <FoodScene markup={SCENES.bag} />
        <span className="impact-card__sticker">
          ⭐ {stats.listingsPosted ?? 0} {stats.listingsPosted === 1 ? 'listing' : 'listings'} listed so far
        </span>
      </div>

      <span className="visually-hidden">{formatMoney(revenue)} recovered in total</span>
    </section>
  )
}
