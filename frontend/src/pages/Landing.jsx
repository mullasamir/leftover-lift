import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'
import { toCardListing } from '../api/adapters.js'
import AnimatedNumber from '../components/AnimatedNumber.jsx'
import BenefitCards from '../components/BenefitCards.jsx'
import Faq from '../components/Faq.jsx'
import FoodCard from '../components/FoodCard.jsx'
import FoodGlyph from '../components/FoodGlyph.jsx'
import FoodScene from '../components/FoodScene.jsx'
import { closedScene, SCENES } from '../components/scenes.js'
import Impact from '../components/Impact.jsx'
import JoinButton from '../components/JoinButton.jsx'
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

/** The food that is really on offer right now, soonest to close first. */
function useLiveFood(size) {
  const [state, setState] = useState({ phase: 'loading', items: [] })
  useEffect(() => {
    let cancelled = false
    api.listings
      .search({ sort: 'CLOSING', size })
      .then((res) => !cancelled && setState({ phase: 'ready', items: res.content.map(toCardListing) }))
      .catch(() => !cancelled && setState({ phase: 'error', items: [] }))
    return () => {
      cancelled = true
    }
  }, [size])
  return state
}

function usePublicStats() {
  const [stats, setStats] = useState(null)
  useEffect(() => {
    let cancelled = false
    api.stats().then((s) => !cancelled && setStats(s)).catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])
  return stats
}

export default function Landing() {
  const navigate = useNavigate()
  const live = useLiveFood(8)
  const stats = usePublicStats()
  // Real food leads the hero. Only when nothing is listed yet do we show clearly-labelled examples.
  const showExamples = live.phase !== 'loading' && live.items.length === 0
  const heroFront = live.items.length > 0 ? live.items[0] : showExamples ? sampleListings[1] : null
  const heroBack = live.items.length > 1 ? live.items[1] : showExamples ? sampleListings[0] : null
  const frontClosingSoon = showExamples || (heroFront && heroFront.closesAt - Date.now() < 60 * 60 * 1000)
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
          <h1 id="hero-title">Dinner is waiting at <mark>the bakery down the road.</mark></h1>
          <p className="hero__lede">
            Bakeries, cafés and kitchens post what did not sell today. You rescue it for a fraction of the price before the clock runs out.
          </p>
          <div className="hero__actions">
            <Link to="/discover" className="btn">Find food near you</Link>
            <JoinButton role="VENDOR" className="btn btn--ghost">I run a food business</JoinButton>
          </div>
          <ul className="perks">
            <li><Check />Free to join</li>
            <li><Check />Rescues from under ₹150</li>
            <li><Check />Collect within hours</li>
          </ul>
        </div>

        <div className="hero__stage">
          <span className="float float--a" aria-hidden="true"><FoodGlyph category="bakery" /></span>
          <span className="float float--b" aria-hidden="true"><FoodGlyph category="grocery" /></span>
          <span className="float float--c" aria-hidden="true"><FoodGlyph category="cafe" /></span>
          {heroBack && <div className="hero__card hero__card--back"><FoodCard listing={heroBack} example={showExamples} onRescue={toDiscover} /></div>}
          {heroFront && <div className="hero__card hero__card--front">
            {frontClosingSoon && <p className="hero__note" aria-hidden="true">
              <span>almost gone!</span>
              <svg viewBox="0 0 52 42" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 5c14-4 28 2 36 20" />
                <path d="M30 24l9 3 3-10" />
              </svg>
            </p>}
            <FoodCard listing={heroFront} example={showExamples} onRescue={toDiscover} />
          </div>}
        </div>
      </section>

      <p className="scrollcue hand" aria-hidden="true">
        scroll and watch the day wind down
        <svg viewBox="0 0 20 28" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3v20M3 17l7 8 7-8" /></svg>
      </p>

      <Ticker />

      {/* ---------- Real numbers, only once there is something to count ---------- */}
      {stats && (stats.businesses > 0 || stats.portionsRescued > 0) ? (
        <section className="page live-numbers" aria-label="Leftover Lift so far">
          <Reveal className="live-numbers__row">
            <p><strong><AnimatedNumber whenVisible value={stats.businesses} /></strong><span>{stats.businesses === 1 ? 'business' : 'businesses'} on the platform</span></p>
            <p><strong><AnimatedNumber whenVisible value={stats.liveListings} /></strong><span>{stats.liveListings === 1 ? 'rescue' : 'rescues'} available right now</span></p>
            <p><strong><AnimatedNumber whenVisible value={stats.portionsRescued} /></strong><span>{stats.portionsRescued === 1 ? 'portion' : 'portions'} rescued so far</span></p>
          </Reveal>
        </section>
      ) : null}

      {/* ---------- Why it matters ---------- */}
      <section className="page why" aria-labelledby="why-title">
        <Reveal className="panel panel--mint why__panel">
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
              That food took land, water, fuel and someone's early morning to make. When it ends up in a landfill it rots and releases
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
          <Reveal className="panel panel--sun rescues__title">
            <h2 id="rescues-title">On the table tonight</h2>
            <p>{live.items.length > 0 ? 'Fresh from kitchens that are closing up. The soonest to close come first.' : 'Businesses post what is left as they close up, so this shelf fills up through the evening.'}</p>
          </Reveal>
          {live.items.length > 1 && <div className="rail-btns">
            <button type="button" className="rail-btn" onClick={() => scrollRail(-1)} aria-label="Previous rescues"><Arrow dir="left" /></button>
            <button type="button" className="rail-btn" onClick={() => scrollRail(1)} aria-label="Next rescues"><Arrow dir="right" /></button>
          </div>}
        </div>
        {live.items.length > 0 ? (
          <>
            <div className="rail" ref={railRef} tabIndex={0} role="region" aria-label="Food available now, scroll sideways">
              {live.items.map((l, i) => (
                <Reveal key={l.id} variant="pop" delay={i * 70}><FoodCard listing={l} onRescue={toDiscover} /></Reveal>
              ))}
            </div>
            <Link to="/discover" className="btn btn--ghost">See everything nearby</Link>
          </>
        ) : live.phase === 'loading' ? (
          <p className="loading" role="status">Looking for food...</p>
        ) : (
          <div className="empty">
            <h3>No food listed right now</h3>
            <p>Kitchens post what is left as they close up. Check back this evening, or help us get started.</p>
            <div className="page-hero__actions">
              <Link to="/discover" className="btn btn--ghost">Check the shelf</Link>
              <JoinButton role="VENDOR" className="btn btn--accent">Post the first listing</JoinButton>
            </div>
          </div>
        )}
      </section>

      {/* ---------- Two ways in (Which side of the counter are you on?) ---------- */}
      <section className="page paths" aria-labelledby="paths-title">
        <div className="paths__header">
          <span className="paths__badge">
            <span className="badge-pulse"></span>
            Two Ways to Join the Movement
          </span>
          <h2 id="paths-title">Which side of the counter are you on?</h2>
          <p className="paths__sub">
            Whether you want to rescue incredible surplus meals at 70% off or cut kitchen waste into pure margin, Leftover Lift is built for you.
          </p>
        </div>

        <div className="paths__grid">
          {/* Consumer / Eater Path */}
          <Reveal variant="deal" className="pathcard pathcard--eat">
            <div className="pathcard__pill">
              <span>🥗 For Hungry Foodies & Savers</span>
              <span className="pathcard__tag">Save Up to 70%</span>
            </div>

            <div className="pathcard__art">
              <FoodScene markup={SCENES.meals} />
            </div>

            <div className="pathcard__content">
              <h3>I want to rescue food</h3>
              <p className="pathcard__summary">
                Get high-quality meals, artisan bread, and fresh groceries from your favourite local spots before closing time.
              </p>

              <ul className="pathcard__features">
                <li>
                  <span className="pfeat-icon pfeat-icon--leaf"><Check /></span>
                  <div>
                    <strong>Fresh food from top local kitchens</strong>
                    <span>Delicious surplus from spots you love at a fraction of menu price</span>
                  </div>
                </li>
                <li>
                  <span className="pfeat-icon pfeat-icon--leaf"><Check /></span>
                  <div>
                    <strong>Zero subscription & cancel anytime</strong>
                    <span>Reserve in 2 clicks, pay securely, and pickup during closing hours</span>
                  </div>
                </li>
                <li>
                  <span className="pfeat-icon pfeat-icon--leaf"><Check /></span>
                  <div>
                    <strong>Track your environmental savings</strong>
                    <span>Grow your virtual forest, earn badges, and watch your CO₂ counter drop</span>
                  </div>
                </li>
              </ul>

              <div className="pathcard__actions">
                <JoinButton className="btn">Join as a customer &rarr;</JoinButton>
                <Link to="/how-it-works" className="btn btn--ghost">How it works</Link>
              </div>
            </div>
          </Reveal>

          {/* Business / Vendor Path */}
          <Reveal variant="deal" delay={120} className="pathcard pathcard--sell">
            <div className="pathcard__pill">
              <span>💼 For Cafés, Bakeries & Restaurants</span>
              <span className="pathcard__tag pathcard__tag--amber">Recover Revenue</span>
            </div>

            <div className="pathcard__art">
              <FoodScene markup={SCENES.bakery} />
            </div>

            <div className="pathcard__content">
              <h3>I run a food business</h3>
              <p className="pathcard__summary">
                Turn evening surplus into revenue, lower disposal fees, and attract new loyal customers right into your shop.
              </p>

              <ul className="pathcard__features">
                <li>
                  <span className="pfeat-icon pfeat-icon--amber"><Check /></span>
                  <div>
                    <strong>Post surplus in under 60 seconds</strong>
                    <span>Quick mobile listing before closing — no complex inventory setup needed</span>
                  </div>
                </li>
                <li>
                  <span className="pfeat-icon pfeat-icon--amber"><Check /></span>
                  <div>
                    <strong>Automatic smart discounting</strong>
                    <span>Surprise bag pricing and pickup slots are generated automatically</span>
                  </div>
                </li>
                <li>
                  <span className="pfeat-icon pfeat-icon--amber"><Check /></span>
                  <div>
                    <strong>Attract new foot-traffic daily</strong>
                    <span>Over 65% of rescue customers buy additional full-price items at pickup</span>
                  </div>
                </li>
              </ul>

              <div className="pathcard__actions">
                <JoinButton role="VENDOR" className="btn btn--accent">Partner your kitchen &rarr;</JoinButton>
                <Link to="/for-businesses" className="btn btn--ghost">See business benefits</Link>
              </div>
            </div>
          </Reveal>
        </div>
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
        <BenefitCards />

        <Reveal className="sunband">
          <h2>Made more than you sold today?</h2>
          <p>List your surplus in under a minute and let the neighbourhood come and get it.</p>
          <JoinButton role="VENDOR" className="btn">Join as a business</JoinButton>
        </Reveal>
      </section>
    </>
  )
}
