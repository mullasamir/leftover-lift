import { useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AnimatedNumber from '../components/AnimatedNumber.jsx'
import Faq from '../components/Faq.jsx'
import FoodCard from '../components/FoodCard.jsx'
import FoodGlyph from '../components/FoodGlyph.jsx'
import FoodScene from '../components/FoodScene.jsx'
import { closedScene } from '../components/scenes.js'
import Impact from '../components/Impact.jsx'
import Journey from '../components/Journey.jsx'
import Reveal from '../components/Reveal.jsx'
import SkyClock from '../components/SkyClock.jsx'
import Ticker from '../components/Ticker.jsx'
import { sampleListings } from '../data/mockListings.js'

const Check = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 10.5l4 4 8-9" />
  </svg>
)

const Arrow = ({ dir }) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={dir === 'left' ? 'M12 4l-6 6 6 6' : 'M8 4l6 6-6 6'} />
  </svg>
)

const BENEFITS = [
  {
    title: 'Win back some of the cost',
    body: 'Food you would have binned becomes income. Even a small price covers part of what it cost to make.',
    bg: '#ffd59a',
    icon: <path d="M12 3v18M16.5 7.5c-1-1.5-3-2-4.5-2-2.5 0-4 1.3-4 3s1.5 2.6 4 3 4 1.2 4 3-1.5 3-4 3c-1.8 0-3.7-.7-4.8-2.2" />,
  },
  {
    title: 'Meet your neighbours',
    body: 'People who find you through a rescue may come back for the full-price menu. A good first taste is the best advertising.',
    bg: '#dccff7',
    icon: <path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10z" />,
  },
  {
    title: 'See what you save',
    body: 'Every rescue adds to your running total of meals saved and waste avoided, ready to share with your team and customers.',
    bg: '#bdebd6',
    icon: <path d="M4 20V10m6 10V4m6 16v-7m4 7H2" />,
  },
]

export default function Landing() {
  const navigate = useNavigate()
  const railRef = useRef(null)
  const toDiscover = () => navigate('/discover')

  function scrollRail(direction) {
    const rail = railRef.current
    if (!rail) return
    const card = rail.firstElementChild
    const step = (card ? card.getBoundingClientRect().width : 300) + 20
    rail.scrollBy({ left: direction * step, behavior: 'smooth' })
  }

  return (
    <>
      <SkyClock />

      {/* ---------- Hero ---------- */}
      <section className="page hero" aria-labelledby="hero-title">
        <div className="hero__copy">
          <h1 id="hero-title">Dinner is waiting at the bakery down the road.</h1>
          <p className="hero__lede">
            Bakeries, cafés and kitchens post what did not sell today. You rescue it for a fraction of the price before the clock runs out.
          </p>
          <div className="hero__actions">
            <Link to="/discover" className="btn">Find food near you</Link>
            <Link to="/register?role=VENDOR" className="btn btn--ghost">I run a food business</Link>
          </div>
          <ul className="perks">
            <li><Check />Free to join</li>
            <li><Check />Rescues from a few dollars</li>
            <li><Check />Collect within hours</li>
          </ul>
        </div>

        <div className="hero__stage">
          <span className="float float--a" aria-hidden="true"><FoodGlyph category="bakery" /></span>
          <span className="float float--b" aria-hidden="true"><FoodGlyph category="grocery" /></span>
          <span className="float float--c" aria-hidden="true"><FoodGlyph category="cafe" /></span>
          <div className="hero__card hero__card--back"><FoodCard listing={sampleListings[0]} onRescue={toDiscover} /></div>
          <div className="hero__card hero__card--front">
            <p className="hero__note" aria-hidden="true">
              <span>almost gone!</span>
              <svg viewBox="0 0 52 42" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 5c14-4 28 2 36 20" />
                <path d="M30 24l9 3 3-10" />
              </svg>
            </p>
            <FoodCard listing={sampleListings[1]} onRescue={toDiscover} />
          </div>
        </div>
      </section>

      <p className="scrollcue hand" aria-hidden="true">
        scroll and watch the day wind down
        <svg viewBox="0 0 20 28" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3v20M3 17l7 8 7-8" /></svg>
      </p>

      <Ticker />

      {/* ---------- Why it matters ---------- */}
      <section className="page why" aria-labelledby="why-title">
        <Reveal className="panel why__panel">
          <div className="why__lead">
            <h2 id="why-title">Good food is thrown away every evening.</h2>
            <p className="hand">and it is fixable</p>
            <FoodScene className="why__art" markup={closedScene} />
          </div>
          <div className="why__copy">
            <p>
              Every day, bakeries, cafés and kitchens make more than they sell. It is not carelessness. Nobody can predict a rainy
              Tuesday, so shops cook and bake for the customers they hope to have, and what is left at closing time usually goes in the bin.
            </p>
            <p>
              That food took land, water, fuel and someone’s early morning to make. When it ends up in a landfill it rots and releases
              methane, a greenhouse gas far stronger than carbon dioxide. Worldwide, about a third of the food we produce is never eaten.
            </p>
            <p>
              Rescuing a meal is the simplest fix there is. The food already exists, it is still good, and someone nearby is hungry.
              Leftover Lift connects the two in the hours between closing time and the bin, so a business recovers a little of its cost
              and you eat well for less.
            </p>
          </div>

          <div className="stats">
            <p className="stat"><strong><AnimatedNumber whenVisible value={33} prefix="~" suffix="%" /></strong><span>of all food produced is lost or wasted</span></p>
            <p className="stat"><strong><AnimatedNumber whenVisible value={1.05} decimals={2} suffix=" bn" /></strong><span>tonnes of food wasted worldwide in 2022</span></p>
            <p className="stat"><strong>8–<AnimatedNumber whenVisible value={10} suffix="%" /></strong><span>of global greenhouse gas emissions come from food loss and waste</span></p>
          </div>
          <p className="why__source">Figures are approximate. Sources: FAO and the UNEP Food Waste Index Report 2024.</p>
        </Reveal>
      </section>

      {/* ---------- Pinned story ---------- */}
      <Journey />

      {/* ---------- Food rail ---------- */}
      <section className="page rescues" aria-labelledby="rescues-title">
        <div className="rescues__head">
          <Reveal className="panel rescues__title">
            <h2 id="rescues-title">On the table tonight</h2>
            <p>These are sample rescues. Once businesses join, this shelf fills with real food from places near you.</p>
          </Reveal>
          <div className="rail-btns">
            <button type="button" className="rail-btn" onClick={() => scrollRail(-1)} aria-label="Previous rescues"><Arrow dir="left" /></button>
            <button type="button" className="rail-btn" onClick={() => scrollRail(1)} aria-label="Next rescues"><Arrow dir="right" /></button>
          </div>
        </div>
        <div className="rail" ref={railRef} tabIndex={0} role="region" aria-label="Sample rescues, scroll sideways">
          {sampleListings.map((l, i) => (
            <Reveal key={l.id} variant="pop" delay={i * 70}><FoodCard listing={l} onRescue={toDiscover} /></Reveal>
          ))}
        </div>
        <Link to="/discover" className="btn btn--ghost">See everything nearby</Link>
      </section>

      {/* ---------- Impact calculator ---------- */}
      <Impact />

      {/* ---------- FAQ ---------- */}
      <Faq />

      {/* ---------- Businesses and night CTA ---------- */}
      <section className="page biz" aria-labelledby="biz-title">
        <Reveal className="panel biz__head">
          <h2 id="biz-title">For kitchens, bakeries and shops</h2>
          <p>Closing time does not have to end in the bin. Here is what a rescue does for a business.</p>
        </Reveal>
        <div className="biz__grid">
          {BENEFITS.map((b, i) => (
            <Reveal key={b.title} variant="deal" delay={i * 90} className="biz-card" style={{ '--ico-bg': b.bg }}>
              <span className="biz-card__ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="#2B2358" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{b.icon}</svg>
              </span>
              <h3>{b.title}</h3>
              <p>{b.body}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="nightband">
          <h2>Made more than you sold today?</h2>
          <p>List your surplus in under a minute and let the neighbourhood come and get it.</p>
          <Link to="/register?role=VENDOR" className="btn">Join as a business</Link>
        </Reveal>
      </section>
    </>
  )
}
