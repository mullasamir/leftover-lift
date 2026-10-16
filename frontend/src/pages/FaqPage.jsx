import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero.jsx'

const GROUPS = [
  { id: 'all', label: 'Everything' },
  { id: 'customers', label: 'Customers' },
  { id: 'businesses', label: 'Businesses' },
  { id: 'safety', label: 'Food and safety' },
]

const QUESTIONS = [
  { g: 'customers', q: 'How does pickup work?', a: 'Every listing has a pickup window and a countdown. Reserve before the clock reaches zero, go to the business during the window, and read out your pickup code at the counter.' },
  { g: 'customers', q: 'Do I pay when I reserve?', a: 'No. You pay at the counter when you collect, so there is nothing to pay up front.' },
  { g: 'customers', q: 'How many portions can I reserve?', a: 'Up to three portions of the same listing at a time, and one active reservation per listing so everyone gets a fair go.' },
  { g: 'customers', q: 'Can I cancel?', a: 'Yes. Open My rescues and cancel any time before the pickup window ends. The portions go straight back on sale for someone else.' },
  { g: 'customers', q: 'What if I am running late?', a: 'Pickup windows are short because the food needs to be eaten that evening. If you cannot make it, cancel so someone else can have it. Reservations that are not collected are marked as missed.' },
  { g: 'customers', q: 'What is in the bag?', a: 'Each listing tells you what to expect. Some are exact (two sourdough loaves) and some are surprises within a type (a veg box). The description lists what is inside.' },
  { g: 'businesses', q: 'How do I post food?', a: 'Open My listings and choose Post surplus food. Add a name, what is included, the usual price, the rescue price and a pickup window. The discount percentage is worked out automatically.' },
  { g: 'businesses', q: 'Can I change a listing after posting?', a: 'Yes, until it ends. Once someone has reserved a portion the prices are locked, so nobody pays more than they agreed to, though you can still add portions.' },
  { g: 'businesses', q: 'How do I confirm a handover?', a: 'Ask the customer for their six-character code and type it into the pickup desk on your dashboard. You will not see the code anywhere else, so it cannot be guessed.' },
  { g: 'businesses', q: 'Does it cost anything?', a: 'Leftover Lift does not charge businesses anything in this version.' },
  { g: 'businesses', q: 'What if nobody collects?', a: 'The listing closes automatically when the pickup window ends, and uncollected reservations are marked as missed. You can post the same food again with one click.' },
  { g: 'safety', q: 'Is rescued food safe to eat?', a: 'Businesses should only list food that is still good: fresh bakes at the end of the day, meals made today, produce that is perfectly fine but will not sell. Each listing describes what is inside so you know before you collect.' },
  { g: 'safety', q: 'What about allergies?', a: 'Listings can carry notes such as vegetarian, vegan, contains gluten, dairy or nuts. These are provided by the business, so if you have a serious allergy, ask at the counter before you eat.' },
  { g: 'safety', q: 'Who is responsible for the food?', a: 'The business that made it. Leftover Lift only connects businesses and customers, so food safety and allergen accuracy stay with the business, as with any other sale.' },
]

export default function FaqPage() {
  const [group, setGroup] = useState('all')
  const [query, setQuery] = useState('')

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return QUESTIONS.filter((item) => (group === 'all' || item.g === group) && (!q || `${item.q} ${item.a}`.toLowerCase().includes(q)))
  }, [group, query])

  return (
    <div className="page content">
      <PageHero tone="sky" title="Good questions" hand="quick answers" lede="Search, or pick a topic. If you cannot find what you need, we are one message away." />

      <div className="panel faq faq-page">
        <div className="controls">
          <div className="field search">
            <label className="visually-hidden" htmlFor="faq-q">Search the questions</label>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5" /><path d="M13 13l4 4" /></svg>
            <input id="faq-q" type="search" placeholder="Search, for example “late” or “code”…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>

        <div className="chips" role="group" aria-label="Topic">
          {GROUPS.map((g) => (
            <button key={g.id} type="button" className="chip" aria-pressed={group === g.id} onClick={() => setGroup(g.id)}>{g.label}</button>
          ))}
        </div>

        <p className="discover__count" role="status">{visible.length} {visible.length === 1 ? 'answer' : 'answers'}</p>

        {visible.length === 0 ? (
          <div className="empty empty--inline">
            <h2 style={{ fontSize: 'var(--step-2)' }}>Nothing matches that</h2>
            <p>Try another word, or ask us directly.</p>
            <Link to="/contact" className="btn btn--small">Contact us</Link>
          </div>
        ) : (
          <div className="faq__list">
            {visible.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        )}
      </div>

      <div className="panel panel--tight faq-page__cta">
        <h2>Still stuck?</h2>
        <Link to="/contact" className="btn btn--accent">Send us a message</Link>
      </div>
    </div>
  )
}
