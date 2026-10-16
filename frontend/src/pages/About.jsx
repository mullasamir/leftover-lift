import { Link } from 'react-router-dom'
import AnimatedNumber from '../components/AnimatedNumber.jsx'
import FoodScene from '../components/FoodScene.jsx'
import PageHero from '../components/PageHero.jsx'
import Reveal from '../components/Reveal.jsx'
import { SCENES } from '../components/scenes.js'

const HELPS = [
  { who: 'Neighbours', scene: 'bakery', bg: '#ffe27a', text: 'Eat well for less. Fresh bakes, hot meals and produce at a fraction of the price, from places you already walk past.' },
  { who: 'Businesses', scene: 'meals', bg: '#ffc9da', text: 'Recover some of what the food cost to make, meet new regulars, and feel good about closing time instead of dreading the bin.' },
  { who: 'The planet', scene: 'grocery', bg: '#c9f5dd', text: 'Food in landfills rots and releases methane. Every meal that is eaten instead is food, water and energy that was not wasted.' },
]

const VALUES = [
  { title: 'Fresh, not fancy', text: 'Surplus food is good food that did not sell, not food that is past its best. We want it delicious, not perfect.' },
  { title: 'Fair for everyone', text: 'Businesses set their own prices, customers see exactly what they pay, and nobody is charged for browsing.' },
  { title: 'Local first', text: 'A rescue is a short walk to the bakery down the road. The best food waste solutions are the ones close to home.' },
  { title: 'Honest by default', text: 'Every listing shows what is inside, any allergens, the price, and a pickup window with a clock. No surprises, except the nice kind.' },
]

export default function About() {
  return (
    <div className="page content">
      <PageHero
        tone="mint"
        title="Good food deserves a second chance"
        hand="that is the whole idea"
        lede="Every evening, kitchens close with food that is still delicious. Leftover Lift helps it find a plate instead of a bin, and helps neighbours find a great meal for less."
      >
        <div className="page-hero__actions">
          <Link to="/discover" className="btn">Find food near you</Link>
          <Link to="/for-businesses" className="btn btn--ghost">I run a food business</Link>
        </div>
      </PageHero>

      <Reveal className="panel about__story">
        <h2>Why Leftover Lift exists</h2>
        <div className="about__copy">
          <p>
            Nobody wastes food on purpose. Bakeries bake for the customers they hope to have, cafés prep for a busy day that turns out
            quiet, and kitchens cook generously because running out is worse than having extra. The result is a bin full of good food at closing time.
          </p>
          <p>
            At the same time, plenty of people would happily buy that food at a lower price if they only knew it was there. The food, the
            hunger and the closing time all exist already. What was missing was a simple way to connect them before the clock runs out.
          </p>
          <p>
            That is what this app does. A business posts what is left, a neighbour reserves it, and a short code at the counter completes the
            handover. It is deliberately simple, because the simpler it is for a busy kitchen, the more food gets saved.
          </p>
        </div>
        <div className="stats">
          <p className="stat"><strong><AnimatedNumber whenVisible value={33} prefix="~" suffix="%" /></strong><span>of all food produced is lost or wasted</span></p>
          <p className="stat"><strong><AnimatedNumber whenVisible value={1.05} decimals={2} suffix=" bn" /></strong><span>tonnes of food wasted worldwide in 2022</span></p>
          <p className="stat"><strong>8–<AnimatedNumber whenVisible value={10} suffix="%" /></strong><span>of global greenhouse gas emissions come from food loss and waste</span></p>
        </div>
        <p className="source">Figures are approximate. Sources: FAO and the UNEP Food Waste Index Report 2024.</p>
      </Reveal>

      <section aria-labelledby="helps-title" className="content__section">
        <Reveal className="panel panel--tight"><h2 id="helps-title">Who it helps</h2></Reveal>
        <div className="triple">
          {HELPS.map((h, i) => (
            <Reveal key={h.who} variant="deal" delay={i * 90} className="helpcard" style={{ '--tint': h.bg }}>
              <div className="helpcard__art"><FoodScene markup={SCENES[h.scene]} /></div>
              <h3>{h.who}</h3>
              <p>{h.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section aria-labelledby="values-title" className="content__section">
        <Reveal className="panel panel--blush">
          <h2 id="values-title">What we believe</h2>
          <ul className="values">
            {VALUES.map((v) => (
              <li key={v.title}>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <Reveal className="sunband">
        <h2>Ready to rescue something?</h2>
        <p>Browse what is left near you today, or tell us what we could do better.</p>
        <div className="page-hero__actions">
          <Link to="/discover" className="btn">Find food</Link>
          <Link to="/contact" className="btn btn--ghost">Get in touch</Link>
        </div>
      </Reveal>
    </div>
  )
}
