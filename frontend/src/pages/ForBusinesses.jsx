import { useState } from 'react'
import { Link } from 'react-router-dom'
import AnimatedNumber from '../components/AnimatedNumber.jsx'
import BenefitCards from '../components/BenefitCards.jsx'
import PageHero from '../components/PageHero.jsx'
import Reveal from '../components/Reveal.jsx'
import SliderField from '../components/SliderField.jsx'
import { currencySymbol, formatMoney } from '../lib/money.js'

const KG_PER_PORTION = 0.45
const CO2E_PER_KG = 2.5

export default function ForBusinesses() {
  const [leftover, setLeftover] = useState(8) // portions left at closing, per day
  const [price, setPrice] = useState(250) // usual price per portion
  const [discount, setDiscount] = useState(60) // percent off
  const [days, setDays] = useState(26) // days open per month
  const [share, setShare] = useState(75) // percent of portions that get collected

  const rescued = Math.round(leftover * days * (share / 100))
  const recovered = rescued * price * (1 - discount / 100)
  const kg = rescued * KG_PER_PORTION
  const co2 = kg * CO2E_PER_KG

  return (
    <div className="page content">
      <PageHero
        tone="blush"
        title="Closing time does not have to end in the bin"
        hand="turn leftovers into regulars"
        lede="Post what you have left in under a minute, let the neighbourhood come and get it, and recover some of what it cost to make."
      >
        <div className="page-hero__actions">
          <Link to="/register?role=VENDOR" className="btn btn--accent">Create a business account</Link>
          <Link to="/how-it-works" className="btn btn--ghost">See how it works</Link>
        </div>
      </PageHero>

      <Reveal className="panel calc-panel" aria-labelledby="calc-title">
        <div className="calc-panel__intro">
          <h2 id="calc-title">How much could you recover?</h2>
          <p>Slide the numbers to match your kitchen. It is a rough estimate to help you picture it, not a promise.</p>
        </div>

        <div className="calc-panel__grid">
          <div className="calc">
            <SliderField label="Portions left at closing, per day" min={1} max={40} value={leftover} onChange={setLeftover} />
            <SliderField label="Usual price per portion" min={50} max={1000} step={10} value={price} onChange={setPrice} format={(v) => formatMoney(v)} />
            <SliderField label="Discount you offer" min={30} max={80} step={5} value={discount} onChange={setDiscount} format={(v) => `${v}% off`} />
            <SliderField label="Days you open each month" min={10} max={30} value={days} onChange={setDays} />
            <SliderField label="Share that gets collected" min={40} max={100} step={5} value={share} onChange={setShare} format={(v) => `${v}%`} />
          </div>

          <div className="results results--big" aria-live="polite">
            <p className="result result--hero">
              <strong><AnimatedNumber value={recovered} prefix={currencySymbol} /></strong>
              <span>recovered every month</span>
            </p>
            <p className="result"><strong><AnimatedNumber value={rescued} /></strong><span>meals kept out of the bin</span></p>
            <p className="result"><strong><AnimatedNumber value={kg} suffix=" kg" /></strong><span>of food saved</span></p>
            <p className="result result--wide"><strong><AnimatedNumber value={co2} suffix=" kg" /></strong><span>CO₂e avoided, roughly</span></p>
          </div>
        </div>
        <p className="impact__note">Assumes about 0.45 kg of food per portion and 2.5 kg CO₂e per kg of wasted food.</p>
      </Reveal>

      <section aria-labelledby="why-biz-title" className="content__section">
        <Reveal className="panel panel--tight"><h2 id="why-biz-title">Why businesses like it</h2></Reveal>
        <BenefitCards />
      </section>

      <section aria-labelledby="start-title" className="content__section">
        <Reveal className="panel panel--mint">
          <h2 id="start-title">Start in three steps</h2>
          <ol className="start">
            <li><strong>Create your account.</strong> Add your business name, type and pickup address.</li>
            <li><strong>Post your first listing.</strong> The discount is calculated for you, and a preview shows exactly what customers will see.</li>
            <li><strong>Hand over with a code.</strong> Type the customer’s code into the pickup desk and watch your impact card grow.</li>
          </ol>
        </Reveal>
      </section>

      <Reveal className="sunband">
        <h2>Made more than you sold today?</h2>
        <p>Your first listing takes less than a minute.</p>
        <Link to="/register?role=VENDOR" className="btn">Join as a business</Link>
      </Reveal>
    </div>
  )
}
