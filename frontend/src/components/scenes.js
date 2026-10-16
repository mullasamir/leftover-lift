// Hand-drawn style food illustrations as raw SVG markup (trusted, static strings).
// Shared look: 3px ink outline, flat fills, round joins.
const INK = '#14342B'
const S = `stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`
const SHADOW = '<ellipse cx="120" cy="146" rx="96" ry="9" fill="rgba(43,35,88,.14)"/>'

export const STEAM = (x = 100) =>
  `<g class="steam" fill="none" ${S}><path d="M${x} 30c-7-8 7-12 0-22"/><path d="M${x + 24} 26c-7-8 7-12 0-22"/><path d="M${x + 48} 30c-7-8 7-12 0-22"/></g>`

export const SCENES = {
  bakery: `${SHADOW}
    <path d="M40 138C28 98 54 62 104 62s78 36 66 76z" fill="#E59A3C" ${S}/>
    <path d="M70 82l14 34M100 74l10 42M130 82l-2 34" stroke="#FFE2A8" stroke-width="7" stroke-linecap="round" fill="none"/>
    <path d="M150 134c-10-22 2-48 30-54 14-3 28 4 32 18 6 18-6 36-24 42-12 4-30 2-38-6z" fill="#F4B860" ${S}/>
    <path d="M172 86l6 42M190 82l2 46M206 92l-6 38" stroke="#C97F1F" stroke-width="3.5" stroke-linecap="round" fill="none"/>
    <circle cx="52" cy="132" r="14" fill="#F4B860" ${S}/>
    <path d="M46 128c3-3 9-3 12 0" stroke="#C97F1F" stroke-width="3" stroke-linecap="round" fill="none"/>`,

  meals: `${SHADOW}
    <path d="M40 88h160c0 36-34 56-80 56S40 124 40 88z" fill="#FFFBF2" ${S}/>
    <path d="M54 106h132" stroke="#E8DCC2" stroke-width="5" stroke-linecap="round"/>
    <path d="M52 88c6-24 36-32 68-32s62 8 68 32z" fill="#E8872A" ${S}/>
    <path d="M94 62c4-20 16-30 26-30s22 10 26 30z" fill="#fff" ${S}/>
    <circle cx="78" cy="74" r="7" fill="#FFD27A" ${S}/><circle cx="160" cy="72" r="7" fill="#FFD27A" ${S}/>
    <path d="M118 80c3-6 9-6 12 0" stroke="#1F9D77" stroke-width="4" stroke-linecap="round" fill="none"/>
    ${STEAM(96)}`,

  cafe: `${SHADOW}
    <path d="M20 112c0 8 20 12 46 12s46-4 46-12z" fill="#E7B36A" ${S}/>
    <rect x="16" y="98" width="100" height="12" rx="6" fill="#6CC08B" ${S}/>
    <rect x="22" y="86" width="88" height="12" rx="6" fill="#E4442F" ${S}/>
    <path d="M20 86c0-22 20-30 46-30s46 8 46 30z" fill="#E7B36A" ${S}/>
    <circle cx="50" cy="70" r="2.5" fill="#FFE2A8"/><circle cx="68" cy="66" r="2.5" fill="#FFE2A8"/><circle cx="86" cy="72" r="2.5" fill="#FFE2A8"/>
    <ellipse cx="172" cy="140" rx="50" ry="8" fill="#EADFC9" ${S}/>
    <path d="M142 76h60v34c0 18-12 30-30 30s-30-12-30-30z" fill="#FFFBF2" ${S}/>
    <path d="M202 86h6c10 0 10 20 0 20h-6" fill="none" ${S}/>
    <ellipse cx="172" cy="76" rx="30" ry="7" fill="#7A4E3A" ${S}/>
    <g class="steam" fill="none" ${S}><path d="M162 58c-6-8 6-12 0-20"/><path d="M182 58c-6-8 6-12 0-20"/></g>`,

  grocery: `${SHADOW}
    <circle cx="82" cy="84" r="24" fill="#E4442F" ${S}/>
    <path d="M70 62c6 4 12 4 12 4s6 0 12-4c-4 10-12 12-12 12s-8-2-12-12z" fill="#1F9D77" ${S}/>
    <path d="M118 58c0-8 38-8 38 0l-19 48z" fill="#FF8A1F" ${S}/>
    <path d="M137 58c-6-14-14-18-18-20M137 58c0-14 2-22 4-26M137 58c6-14 14-18 18-20" stroke="#1F9D77" stroke-width="4" stroke-linecap="round" fill="none"/>
    <path d="M176 104c-16-6-20-26-8-38 10 8 14 20 8 38zm0 0c16-6 20-26 8-38-10 8-14 20-8 38z" fill="#1F9D77" ${S}/>
    <rect x="40" y="96" width="160" height="46" rx="8" fill="#D9A15F" ${S}/>
    <path d="M40 112h160M40 128h160" stroke="${INK}" stroke-width="2.5" fill="none"/>`,

  bag: `<ellipse cx="120" cy="148" rx="80" ry="8" fill="rgba(43,35,88,.14)"/>
    <rect x="100" y="22" width="16" height="56" rx="8" transform="rotate(-16 108 50)" fill="#E59A3C" ${S}/>
    <path d="M132 64c2-18 14-26 26-26-2 14-10 24-26 26z" fill="#1F9D77" ${S}/>
    <path d="M62 62h116l10 84H52z" fill="#E8C896" ${S}/>
    <path d="M62 62l8 16h100l8-16" fill="#D8B27A" ${S}/>
    <path d="M94 62c0-26 52-26 52 0" fill="none" ${S}/>
    <path d="M120 130c-24-14-28-28-19-36 7-6 15-4 19 3 4-7 12-9 19-3 9 8 5 22-19 36z" fill="#E4442F" ${S}/>
    <g fill="#FF9F1C" ${S}>
      <path class="sparkle" d="M30 50l4 10 10 4-10 4-4 10-4-10-10-4 10-4z"/>
      <path class="sparkle" style="animation-delay:.6s" d="M206 36l3 8 8 3-8 3-3 8-3-8-8-3 8-3z"/>
      <path class="sparkle" style="animation-delay:1.1s" d="M204 112l3 8 8 3-8 3-3 8-3-8-8-3 8-3z"/>
    </g>`,

  sign: `<g transform="translate(146 2)">
      <path d="M16 0v22M64 0v22" ${S} fill="none"/>
      <rect x="0" y="22" width="80" height="34" rx="9" fill="#FFFBF2" ${S}/>
      <text x="40" y="45" text-anchor="middle" font-family="Young Serif, Georgia, serif" font-size="16" fill="#D63A2B">Closed</text>
    </g>`,
}

export const closedScene = `${SCENES.bakery}${SCENES.sign}`
export const morningScene = `${SCENES.bakery}${STEAM(96)}`
