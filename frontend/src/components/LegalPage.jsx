import PageHero from './PageHero.jsx'

export default function LegalPage({ title, updated, children }) {
  return (
    <div className="page content">
      <PageHero tone="butter" title={title} lede={`Last updated ${updated}.`} />
      <article className="panel legal">
        <p className="legal__note">
          Leftover Lift is a portfolio project. This page explains how it works in plain language. It is not legal advice, and it
          should be reviewed by a qualified professional before the service is run commercially.
        </p>
        {children}
      </article>
    </div>
  )
}
