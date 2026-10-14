import { useState } from 'react'
import AnimatedNumber from './AnimatedNumber.jsx'
import { currencySymbol, formatMoney } from '../lib/money.js'
import FoodScene from './FoodScene.jsx'
import { SCENES } from './scenes.js'

// Rough, clearly-labelled estimates. Kept in one place so they are easy to change or cite.
const KG_PER_MEAL = 0.45
const CO2E_PER_KG_FOOD = 2.5 // kg CO2-equivalent per kg of food wasted, a commonly used average
const SAVING_PER_MEAL = 250 // rupees, from the sample prices on this page
const KG_CO2_PER_KM_DRIVEN = 0.17

const MAX = 30
const PRESETS = [
  { label: 'Once a week', value: 4 },
  { label: 'Twice a week', value: 8 },
  { label: 'Most days', value: 20 },
]

function Plate() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <circle cx="20" cy="20" r="17" fill="#FFFBF2" stroke="#2B2358" strokeWidth="2.5" />
      <circle cx="20" cy="20" r="10.5" fill="#BDEBD6" stroke="#2B2358" strokeWidth="2" />
      <path d="M20 27c-4-3-6-7-3-10 2-2 3-1 3 1 0-2 1-3 3-1 3 3 1 7-3 10z" fill="#1F9D77" />
    </svg>
  )
}

export default function Impact() {
  const [perMonth, setPerMonth] = useState(8)
  const meals = perMonth * 12
  const kg = meals * KG_PER_MEAL
  const co2 = kg * CO2E_PER_KG_FOOD
  const saved = meals * SAVING_PER_MEAL
  const km = co2 / KG_CO2_PER_KM_DRIVEN
  const fill = `${((perMonth - 1) / (MAX - 1)) * 100}%`

  return (
    <section className="page impact" aria-labelledby="impact-title">
      <div className="panel impact__panel">
        <div className="impact__intro">
          <h2 id="impact-title">What would your plate add up to?</h2>
          <p>
            One rescue feels small. Over a year it is not. Slide to how often you would pick up
            something good, and watch the year fill up.
          </p>
          <p className="hand" style={{ color: 'var(--leaf-text)' }}>every plate is a meal that was not binned</p>
          <FoodScene className="impact__art" markup={SCENES.bag} />
        </div>

        <div className="calc">
          <div>
            <div className="calc__label">
              <label htmlFor="rescues">Rescues per month</label>
              <output htmlFor="rescues" aria-live="polite">{perMonth}</output>
            </div>
            <input
              id="rescues" className="range" type="range" min="1" max={MAX} value={perMonth}
              style={{ '--fill': fill }} onChange={(e) => setPerMonth(Number(e.target.value))}
            />
            <div className="presets" role="group" aria-label="Quick choices">
              {PRESETS.map((p) => (
                <button key={p.value} type="button" className="chip" aria-pressed={perMonth === p.value} onClick={() => setPerMonth(p.value)}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="garden" aria-hidden="true">
            {Array.from({ length: MAX }, (_, i) => (
              <span key={i} className={`plate${i < perMonth ? ' is-on' : ''}`} style={{ '--i': i }}><Plate /></span>
            ))}
          </div>

          <div className="results">
            <p className="result"><strong><AnimatedNumber value={meals} /></strong><span>meals rescued in a year</span></p>
            <p className="result"><strong><AnimatedNumber value={kg} decimals={0} suffix=" kg" /></strong><span>of food kept on plates</span></p>
            <p className="result"><strong><AnimatedNumber value={co2} decimals={0} suffix=" kg" /></strong><span>CO₂e avoided, roughly {Math.round(km).toLocaleString()} km of driving</span></p>
            <p className="result"><strong><AnimatedNumber value={saved} prefix={currencySymbol} /></strong><span>saved against full prices</span></p>
          </div>
          <p className="impact__note">
            Estimates only: about 0.45 kg of food per meal, 2.5 kg CO₂e per kg of wasted food, and an average saving of {formatMoney(SAVING_PER_MEAL)} per rescue based on the sample prices here.
          </p>
        </div>
      </div>
    </section>
  )
}
