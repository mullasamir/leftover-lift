import { useState } from 'react'
import { Link } from 'react-router-dom'
import FoodScene from '../components/FoodScene.jsx'
import PageHero from '../components/PageHero.jsx'
import { SCENES } from '../components/scenes.js'

const PATHS = {
  customers: {
    label: 'I am hungry',
    cta: { to: '/discover', text: 'Find food near you' },
    steps: [
      { scene: 'cafe', tint: '#dff3ff', title: 'Spot something good', text: 'Browse what kitchens near you have left today. Every listing shows the food, what is in it, the price and how long you have.' },
      { scene: 'meals', tint: '#ffd6c4', title: 'Reserve in a tap', text: 'Pick up to three portions and reserve. Nothing to pay now: you settle up at the counter when you collect.' },
      { scene: 'bag', tint: '#ffe27a', title: 'Show your code', text: 'You get a short pickup code. Head over during the pickup window, read it out, and the food is yours.' },
      { scene: 'bakery', tint: '#c9f5dd', title: 'Enjoy, and watch your tree grow', text: 'Every collected rescue adds to your impact: meals saved, food kept out of the bin and money saved, plus a little tree that grows with you.' },
    ],
    notes: [
      ['How many can I reserve?', 'Up to three portions of one listing at a time, and one active reservation per listing.'],
      ['Can I change my mind?', 'Yes. Cancel from My rescues any time before pickup ends and the food goes back on sale for someone else.'],
      ['What if I am late?', 'Pickup windows are short on purpose, because the food needs to be eaten that evening. Reservations that are not collected are marked as missed.'],
    ],
  },
  businesses: {
    label: 'I run a kitchen',
    cta: { to: '/register?role=VENDOR', text: 'Create a business account' },
    steps: [
      { scene: 'bakery', tint: '#ffe27a', title: 'Post what is left', text: 'Type a name, what is included, the usual price and a rescue price. The discount is worked out for you, and you pick a pickup window.' },
      { scene: 'meals', tint: '#ffd6c4', title: 'Neighbours reserve', text: 'Your listing appears for people nearby with a live countdown. Reservations arrive on your dashboard with first name and portions.' },
      { scene: 'bag', tint: '#dff3ff', title: 'Hand over with a code', text: 'When someone arrives they read out their code. Type it into the pickup desk, confirm, and hand over the food.' },
      { scene: 'grocery', tint: '#c9f5dd', title: 'See your impact', text: 'Your dashboard adds up meals rescued, food kept out of the bin and money recovered, in a card you can share.' },
    ],
    notes: [
      ['Does it cost anything?', 'Leftover Lift does not charge businesses anything in this version.'],
      ['Can I change a listing?', 'Yes, until it ends. Once someone has reserved a portion the price is locked, so nobody pays more than they agreed to.'],
      ['What about leftovers nobody takes?', 'Listings close automatically when the pickup window ends. You can post the same food again with one click.'],
    ],
  },
}

export default function HowItWorks() {
  const [who, setWho] = useState('customers')
  const path = PATHS[who]

  return (
    <div className="page content">
      <PageHero tone="butter" title="How Leftover Lift works" hand="four easy steps" lede="Rescuing food takes less time than ordering takeaway. Pick the side you are on.">
        <div className="seg" role="group" aria-label="Choose your side">
          {Object.entries(PATHS).map(([key, p]) => (
            <button key={key} type="button" aria-pressed={who === key} onClick={() => setWho(key)}>{p.label}</button>
          ))}
        </div>
      </PageHero>

      <ol className="steps" key={who}>
        {path.steps.map((s, i) => (
          <li key={s.title} className="step" style={{ '--tint': s.tint, '--i': i }}>
            <div className="step__art"><FoodScene markup={SCENES[s.scene]} /></div>
            <div className="step__text">
              <span className="step__num" aria-hidden="true">{i + 1}</span>
              <h2>{s.title}</h2>
              <p>{s.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <section className="panel panel--tight notes" aria-labelledby="notes-title">
        <h2 id="notes-title">Good to know</h2>
        <dl>
          {path.notes.map(([q, a]) => (
            <div key={q}>
              <dt>{q}</dt>
              <dd>{a}</dd>
            </div>
          ))}
        </dl>
        <div className="page-hero__actions">
          <Link to={path.cta.to} className="btn btn--accent">{path.cta.text}</Link>
          <Link to="/faq" className="btn btn--ghost">More questions</Link>
        </div>
      </section>
    </div>
  )
}
