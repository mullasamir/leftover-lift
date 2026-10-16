// A little tree that grows with every portion you rescue. Static trusted SVG, like the food scenes.
const INK = '#14342B'
const S = `stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`

export const TREE_STAGES = [
  { min: 0, name: 'Seed', blurb: 'Collect your first rescue to make it sprout.' },
  { min: 1, name: 'Sprout', blurb: 'Your first rescue took root.' },
  { min: 3, name: 'Sapling', blurb: 'Growing nicely. Keep rescuing!' },
  { min: 10, name: 'Tree', blurb: 'Strong roots, and fruit on the way.' },
  { min: 25, name: 'Orchard', blurb: 'A whole orchard. The neighbourhood thanks you.' },
]

export function stageFor(portions) {
  let stage = 0
  TREE_STAGES.forEach((s, i) => {
    if (portions >= s.min) stage = i
  })
  return stage
}

const fruit = (cx, cy, color = '#ff5a3d') => `<circle cx="${cx}" cy="${cy}" r="5.500" fill="${color}" ${S} stroke-width="2.200"/>`
const canopy = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#22b573" ${S}/>`
const ground = `<ellipse cx="120" cy="172" rx="98" ry="14" fill="#8fd18a" ${S}/><ellipse cx="120" cy="172" rx="60" ry="7" fill="#7bc27a"/>`

const ART = [
  // Seed
  `${ground}<ellipse cx="120" cy="165" rx="10" ry="6.500" fill="#b07a3e" ${S}/><path class="spark" d="M150 138l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#ffce2e" ${S} stroke-width="2"/>`,
  // Sprout
  `${ground}<path d="M120 166V132" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="M120 140c-4-14-16-18-28-14 2 12 14 18 28 14z" fill="#22b573" ${S}/><path d="M120 134c4-16 16-20 30-16-2 14-16 20-30 16z" fill="#2fd08a" ${S}/>`,
  // Sapling
  `${ground}<path d="M114 168l4-62h6l4 62z" fill="#b07a3e" ${S}/>${canopy(120, 90, 28)}${canopy(98, 106, 20)}${canopy(142, 106, 20)}${fruit(112, 88)}`,
  // Tree
  `${ground}<path d="M110 168l5-74h10l5 74z" fill="#b07a3e" ${S}/>${canopy(120, 70, 36)}${canopy(88, 94, 26)}${canopy(152, 94, 26)}${fruit(108, 68)}${fruit(134, 80)}${fruit(90, 98, '#ffce2e')}${fruit(150, 96)}${fruit(122, 56, '#ffce2e')}`,
  // Orchard
  `${ground}<path d="M52 168l3-44h7l3 44z" fill="#b07a3e" ${S}/>${canopy(58, 112, 20)}${fruit(52, 110)}${fruit(66, 118, '#ffce2e')}<path d="M180 168l3-40h7l3 40z" fill="#b07a3e" ${S}/>${canopy(186, 112, 22)}${fruit(180, 110, '#ffce2e')}${fruit(194, 118)}<path d="M110 168l5-80h10l5 80z" fill="#b07a3e" ${S}/>${canopy(120, 62, 40)}${canopy(84, 90, 28)}${canopy(156, 90, 28)}${fruit(106, 62)}${fruit(132, 74)}${fruit(86, 94, '#ffce2e')}${fruit(154, 92)}${fruit(120, 44, '#ffce2e')}${fruit(138, 56)}${fruit(100, 80, '#ffce2e')}`,
]

export default function GrowTree({ portions }) {
  const stage = stageFor(portions)
  const next = TREE_STAGES[stage + 1]
  const from = TREE_STAGES[stage].min
  const progress = next ? Math.min(1, (portions - from) / (next.min - from)) : 1

  return (
    <div className="tree">
      <svg key={stage} className="tree__svg" viewBox="0 0 240 190" role="img" aria-label={`Your rescue tree is a ${TREE_STAGES[stage].name.toLowerCase()}`} dangerouslySetInnerHTML={{ __html: ART[stage] }} />
      <div className="tree__caption">
        <p className="tree__stage">{TREE_STAGES[stage].name}</p>
        <p className="tree__blurb">{TREE_STAGES[stage].blurb}</p>
        {next && (
          <>
            <div className="tree__bar" role="progressbar" aria-valuemin={0} aria-valuemax={next.min} aria-valuenow={portions} aria-label={`Progress to ${next.name}`}>
              <span style={{ width: `${progress * 100}%` }} />
            </div>
            <p className="tree__next">{next.min - portions} more {next.min - portions === 1 ? 'portion' : 'portions'} to grow a {next.name.toLowerCase()}</p>
          </>
        )}
      </div>
    </div>
  )
}
