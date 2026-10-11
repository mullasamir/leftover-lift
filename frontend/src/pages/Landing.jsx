import { Link, useNavigate } from 'react-router-dom'
import ListingTicket from '../components/ListingTicket.jsx'
import { sampleListings } from '../data/mockListings.js'

const heroListings = [sampleListings[1], sampleListings[0]]

const stops = [
  { mark: '1', title: 'Spot it', body: 'Browse what is left nearby. Every listing shows the price, the pickup window and a running clock.' },
  { mark: '2', title: 'Reserve it', body: 'Claim your portion in a tap. It is held for you until the clock runs out.' },
  { mark: '3', title: 'Collect it', body: 'Show your pickup code at the counter and take dinner home. Nothing goes in the bin.' },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <>
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
        </div>

        <div className="hero__stack">
          <p className="hero__note" aria-hidden="true">
            <span>almost gone!</span>
            <svg viewBox="0 0 52 42" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 5c14-4 28 2 36 20" />
              <path d="M30 24l9 3 3-10" />
            </svg>
          </p>
          {heroListings.map((l) => (
            <ListingTicket key={l.id} listing={l} onRescue={() => navigate('/discover')} />
          ))}
        </div>
      </section>

      <section className="page section" aria-labelledby="how-title">
        <div className="section__head">
          <h2 id="how-title">How a rescue works</h2>
          <p>Three stops between a shelf and your table.</p>
        </div>
        <ol className="path">
          {stops.map((s) => (
            <li className="path__stop" key={s.mark}>
              <span className="path__dot" aria-hidden="true">{s.mark}</span>
              <div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="page section" aria-labelledby="biz-title">
        <div className="band">
          <div className="band__inner">
            <h2 id="biz-title">Made more than you sold today?</h2>
            <p>List your surplus in under a minute. Win back some of the cost and keep good food out of the bin.</p>
            <Link to="/register?role=VENDOR" className="btn">Join as a business</Link>
          </div>
        </div>
      </section>
    </>
  )
}
