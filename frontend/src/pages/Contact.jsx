import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client.js'
import Field from '../components/Field.jsx'
import PageHero from '../components/PageHero.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { confetti } from '../lib/confetti.js'

const TOPICS = [
  { value: 'GENERAL', label: 'Just saying hi' },
  { value: 'BUSINESS', label: 'I run a business' },
  { value: 'PROBLEM', label: 'Something is broken' },
  { value: 'FEEDBACK', label: 'An idea or feedback' },
]

const HELP = [
  { title: 'Customers', text: 'Questions about a reservation or a pickup code? Check My rescues first, then tell us what happened.', to: '/faq', cta: 'Read the FAQ' },
  { title: 'Businesses', text: 'Want to join, or need a hand with a listing? Start with the guide, then write to us.', to: '/for-businesses', cta: 'See how it works for you' },
]

export default function Contact() {
  const { user } = useAuth()
  const [form, setForm] = useState({ name: user?.fullName ?? '', email: user?.email ?? '', topic: 'GENERAL', message: '', website: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  const set = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setErrors({})
    setFormError('')
    try {
      await api.contact.send(form)
      setSent(true)
      confetti({ count: 50 })
    } catch (err) {
      setErrors(err.fieldErrors ?? {})
      setFormError(Object.keys(err.fieldErrors ?? {}).length ? 'A few things need your attention.' : err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page content">
      <PageHero tone="sky" title="Say hello" hand="we love hearing from you" lede="Questions, ideas, a bug that bit you, or a business that wants to join: send us a note and we will read it." />

      <div className="contact">
        <div className="panel contact__form-panel">
          {sent ? (
            <div className="contact__sent" role="status">
              <svg viewBox="0 0 64 64" aria-hidden="true" className="contact__check"><circle cx="32" cy="32" r="28" fill="#c9f5dd" stroke="#14342B" strokeWidth="3" /><path d="M19 33l9 9 18-20" fill="none" stroke="#14342B" strokeWidth="4.500" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <h2>Message sent</h2>
              <p>Thank you, {form.name.split(' ')[0] || 'friend'}. We will reply to {form.email}.</p>
              <div className="page-hero__actions">
                <Link to="/discover" className="btn">Find food</Link>
                <button type="button" className="btn btn--ghost" onClick={() => { setSent(false); setForm((f) => ({ ...f, message: '' })) }}>Send another</button>
              </div>
            </div>
          ) : (
            <form className="form" onSubmit={submit} noValidate>
              <h2>Send a message</h2>
              {formError && <p className="alert" role="alert">{formError}</p>}

              <div className="form__row form__row--2">
                <Field label="Your name" error={errors.name}>
                  {(p) => <input {...p} autoComplete="name" value={form.name} onChange={set('name')} maxLength={120} />}
                </Field>
                <Field label="Email" error={errors.email}>
                  {(p) => <input {...p} type="email" autoComplete="email" value={form.email} onChange={set('email')} />}
                </Field>
              </div>

              <fieldset className="choice">
                <legend>What is it about?</legend>
                <div className="chips" role="group" aria-label="Topic">
                  {TOPICS.map((t) => (
                    <button key={t.value} type="button" className="chip" aria-pressed={form.topic === t.value} onClick={() => setForm((f) => ({ ...f, topic: t.value }))}>{t.label}</button>
                  ))}
                </div>
                {errors.topic && <p className="field__error">{errors.topic}</p>}
              </fieldset>

              <Field label="Your message" error={errors.message} hint={`${form.message.length} / 2000`}>
                {(p) => <textarea {...p} rows={6} maxLength={2000} value={form.message} onChange={set('message')} placeholder="Tell us what is on your mind…" />}
              </Field>

              {/* Honeypot: invisible to people, tempting to bots. */}
              <div className="hp" aria-hidden="true">
                <label>Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} /></label>
              </div>

              <button className="btn btn--accent" disabled={busy}>{busy ? 'Sending…' : 'Send message'}</button>
            </form>
          )}
        </div>

        <aside className="contact__side" aria-label="Other ways to get help">
          {HELP.map((h) => (
            <div key={h.title} className="helpbox">
              <h3>{h.title}</h3>
              <p>{h.text}</p>
              <Link to={h.to} className="btn btn--small btn--ghost">{h.cta}</Link>
            </div>
          ))}
        </aside>
      </div>
    </div>
  )
}
