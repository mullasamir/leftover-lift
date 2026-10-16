import Reveal from './Reveal.jsx'

const BENEFITS = [
  {
    title: 'Win back some of the cost',
    body: 'Food you would have binned becomes income. Even a small price covers part of what it cost to make.',
    bg: '#ffe27a',
    icon: <path d="M12 3v18M16.5 7.5c-1-1.5-3-2-4.5-2-2.5 0-4 1.3-4 3s1.5 2.6 4 3 4 1.2 4 3-1.5 3-4 3c-1.8 0-3.7-.7-4.8-2.2" />,
  },
  {
    title: 'Meet your neighbours',
    body: 'People who find you through a rescue may come back for the full-price menu. A good first taste is the best advertising.',
    bg: '#ffc9da',
    icon: <path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10z" />,
  },
  {
    title: 'See what you save',
    body: 'Every rescue adds to your running total of meals saved and waste avoided, ready to share with your team and customers.',
    bg: '#c9f5dd',
    icon: <path d="M4 20V10m6 10V4m6 16v-7m4 7H2" />,
  },
]

export default function BenefitCards() {
  return (
    <div className="biz__grid">
      {BENEFITS.map((b, i) => (
        <Reveal key={b.title} variant="deal" delay={i * 90} className="biz-card" style={{ '--ico-bg': b.bg }}>
          <span className="biz-card__ico">
            <svg viewBox="0 0 24 24" fill="none" stroke="#14342B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{b.icon}</svg>
          </span>
          <h3>{b.title}</h3>
          <p>{b.body}</p>
        </Reveal>
      ))}
    </div>
  )
}
