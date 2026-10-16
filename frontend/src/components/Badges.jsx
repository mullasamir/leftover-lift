// Collectable badges for rescuers. Each one unlocks from real collected rescues.
const DEFS = [
  { id: 'first', label: 'First rescue', hint: 'Collect your first meal', color: '#ffe27a', done: (s) => s.portions >= 1 },
  { id: 'bread', label: 'Bread lover', hint: 'Rescue 3 bakery portions', color: '#ffd6a0', done: (s) => s.bakery >= 3 },
  { id: 'regular', label: 'Local explorer', hint: 'Collect from 3 different places', color: '#dff3ff', done: (s) => s.places >= 3 },
  { id: 'planet', label: 'Planet pal', hint: 'Rescue 10 portions', color: '#c9f5dd', done: (s) => s.portions >= 10 },
  { id: 'hero', label: 'Neighbourhood hero', hint: 'Rescue 25 portions', color: '#ffc9da', done: (s) => s.portions >= 25 },
]

function Medal({ color, on }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="badge__medal">
      <circle cx="24" cy="24" r="20" fill={on ? color : '#ece8dc'} stroke="#14342B" strokeWidth="2.600" />
      <path d="M24 11l3.900 8 8.800 1.200-6.400 6.200 1.600 8.800-7.900-4.200-7.900 4.200 1.600-8.800-6.400-6.200 8.800-1.200z" fill={on ? '#fffefa' : '#c9c4b3'} stroke="#14342B" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

export default function Badges({ stats }) {
  const earned = DEFS.filter((d) => d.done(stats)).length
  return (
    <div className="badges">
      <h3>Badges <span className="pill">{earned} of {DEFS.length}</span></h3>
      <ul>
        {DEFS.map((d) => {
          const on = d.done(stats)
          return (
            <li key={d.id} className={on ? 'is-earned' : ''}>
              <Medal color={d.color} on={on} />
              <span>
                <strong>{d.label}</strong>
                <small>{on ? 'Earned' : d.hint}</small>
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
