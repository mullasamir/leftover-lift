import AnimatedNumber from '../../components/AnimatedNumber.jsx'
import { currencySymbol } from '../../lib/money.js'

/** The owner's at-a-glance numbers. Every tile jumps to the part of the dashboard behind it. */
export default function Overview({ stats, onJump }) {
  const tiles = [
    { label: 'businesses on the platform', value: stats.businesses, to: ['businesses'] },
    { label: 'live listings', value: stats.listingsByStatus.AVAILABLE ?? 0, to: ['food'] },
    { label: 'live pickups waiting', value: stats.reservationsByStatus.RESERVED ?? 0, to: ['pickups', { view: 'live' }] },
    { label: 'completed pickups', value: stats.reservationsByStatus.COLLECTED ?? 0, to: ['pickups', { view: 'completed' }] },
    { label: 'portions rescued', value: stats.portionsRescued, to: ['pickups', { view: 'completed' }] },
    { label: 'recovered by businesses', value: Number(stats.revenueRecovered), prefix: currencySymbol, to: ['businesses'] },
    { label: 'customers', value: stats.usersByRole.CONSUMER ?? 0, to: ['people'] },
    { label: 'messages to answer', value: stats.unreadMessages, to: ['inbox'] },
  ]

  return (
    <div className="stats stats--overview">
      {tiles.map((t) => (
        <button key={t.label} type="button" className="stat stat--button" onClick={() => onJump(...t.to)}>
          <strong><AnimatedNumber value={t.value} prefix={t.prefix ?? ''} /></strong>
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  )
}
