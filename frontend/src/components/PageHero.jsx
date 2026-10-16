/** The big friendly heading panel at the top of every content page. */
export default function PageHero({ title, lede, hand, tone = 'sun', children }) {
  return (
    <header className={`panel page-hero panel--${tone}`}>
      <h1>{title}</h1>
      {hand && <p className="hand page-hero__hand">{hand}</p>}
      {lede && <p className="page-hero__lede">{lede}</p>}
      {children}
    </header>
  )
}
