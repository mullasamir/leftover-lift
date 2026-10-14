import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client.js'
import { CATEGORY_OPTIONS, TAG_OPTIONS, toCardListing } from '../api/adapters.js'
import DiscountMeter from '../components/DiscountMeter.jsx'
import Field from '../components/Field.jsx'
import FoodCard from '../components/FoodCard.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { currencySymbol } from '../lib/money.js'
import { discountPercent } from '../lib/pricing.js'
import { localInputToIso, roundUpToFiveMinutes, toLocalInput } from '../lib/time.js'

// Which field an API error code belongs to, so the message appears next to the problem.
const CODE_TO_FIELD = {
  RESCUE_PRICE_TOO_HIGH: 'rescuePrice',
  PRICE_LOCKED: 'rescuePrice',
  INVALID_WINDOW: 'pickupEnd',
  WINDOW_IN_PAST: 'pickupEnd',
  WINDOW_TOO_SHORT: 'pickupEnd',
  WINDOW_TOO_FAR: 'pickupEnd',
  QUANTITY_BELOW_RESERVED: 'quantity',
}

const WINDOW_PRESETS = [
  { label: 'Next 2 hours', hours: 2 },
  { label: 'Next 4 hours', hours: 4 },
  { label: 'Next 6 hours', hours: 6 },
]

function emptyForm() {
  const start = roundUpToFiveMinutes()
  return {
    title: '', description: '', category: 'BAKERY', dietaryTags: [],
    originalPrice: '', rescuePrice: '', quantity: 1,
    pickupStart: toLocalInput(start), pickupEnd: toLocalInput(new Date(start.getTime() + 3 * 3600 * 1000)),
  }
}

function formFromListing(l) {
  return {
    title: l.title, description: l.description, category: l.category, dietaryTags: l.dietaryTags ?? [],
    originalPrice: String(Number(l.originalPrice)), rescuePrice: String(Number(l.rescuePrice)), quantity: l.quantityTotal,
    pickupStart: toLocalInput(l.pickupStart), pickupEnd: toLocalInput(l.pickupEnd),
  }
}

/** Client-side checks that mirror the server, so most mistakes are caught before a round trip. */
function validate(form) {
  const errors = {}
  const original = parseFloat(form.originalPrice)
  const rescue = parseFloat(form.rescuePrice)
  if (!form.title.trim()) errors.title = 'Give the food a name.'
  if (!form.description.trim()) errors.description = 'Describe what is included.'
  if (!(original > 0)) errors.originalPrice = 'Add the usual price.'
  if (!(rescue >= 0) || form.rescuePrice === '') errors.rescuePrice = 'Add the rescue price.'
  else if (original > 0 && rescue >= original) errors.rescuePrice = 'Must be lower than the usual price.'
  if (!(Number(form.quantity) >= 1)) errors.quantity = 'Offer at least one portion.'
  const start = new Date(form.pickupStart).getTime()
  const end = new Date(form.pickupEnd).getTime()
  if (!form.pickupStart || Number.isNaN(start)) errors.pickupStart = 'Choose when pickup starts.'
  if (!form.pickupEnd || Number.isNaN(end)) errors.pickupEnd = 'Choose when pickup ends.'
  else if (end <= Date.now()) errors.pickupEnd = 'That time has already passed.'
  else if (!Number.isNaN(start) && end <= start) errors.pickupEnd = 'Pickup must end after it starts.'
  return errors
}

export default function ListingForm() {
  const { id } = useParams()
  const editing = Boolean(id)
  const { user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [phase, setPhase] = useState(editing ? 'loading' : 'ready') // loading | ready | missing
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!editing) return undefined
    let cancelled = false
    api.vendor
      .get(id)
      .then((l) => !cancelled && (setForm(formFromListing(l)), setPhase('ready')))
      .catch(() => !cancelled && setPhase('missing'))
    return () => {
      cancelled = true
    }
  }, [editing, id])

  const set = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }))
  const update = (patch) => setForm((f) => ({ ...f, ...patch }))
  const toggleTag = (tag) => update({ dietaryTags: form.dietaryTags.includes(tag) ? form.dietaryTags.filter((t) => t !== tag) : [...form.dietaryTags, tag] })

  function applyWindow(hours) {
    const start = roundUpToFiveMinutes()
    update({ pickupStart: toLocalInput(start), pickupEnd: toLocalInput(new Date(start.getTime() + hours * 3600 * 1000)) })
  }

  const original = parseFloat(form.originalPrice)
  const rescue = parseFloat(form.rescuePrice)

  // The card exactly as customers will see it, updating as the vendor types.
  const preview = useMemo(() => {
    const start = new Date(form.pickupStart).getTime()
    const end = new Date(form.pickupEnd).getTime()
    const validTimes = Number.isFinite(start) && Number.isFinite(end) && end > start
    const prices = original > 0 && rescue >= 0 && rescue < original
    return toCardListing({
      id: 'preview',
      category: form.category,
      vendor: { businessName: user?.vendor?.businessName ?? 'Your business', city: user?.vendor?.city ?? '' },
      title: form.title.trim() || 'Your food name',
      description: form.description.trim() || 'What is included will show here.',
      dietaryTags: form.dietaryTags,
      quantityRemaining: Number(form.quantity) || 1,
      rescuePrice: prices ? rescue : 0,
      originalPrice: prices ? original : 0,
      discountPercent: prices ? discountPercent(original, rescue) : 0,
      pickupStart: validTimes ? new Date(start).toISOString() : new Date().toISOString(),
      pickupEnd: validTimes ? new Date(end).toISOString() : new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
    })
  }, [form, original, rescue, user])

  async function submit(e) {
    e.preventDefault()
    setFormError('')
    const found = validate(form)
    setErrors(found)
    if (Object.keys(found).length) {
      setFormError('A few things need your attention.')
      return
    }

    setBusy(true)
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      dietaryTags: form.dietaryTags,
      originalPrice: original,
      rescuePrice: rescue,
      quantity: Number(form.quantity),
      pickupStart: localInputToIso(form.pickupStart),
      pickupEnd: localInputToIso(form.pickupEnd),
    }
    try {
      if (editing) await api.vendor.update(id, payload)
      else await api.vendor.create(payload)
      navigate('/vendor', { state: { flash: editing ? 'Listing updated.' : 'Listing posted. Neighbours can see it now.' } })
    } catch (err) {
      const mapped = { ...err.fieldErrors }
      if (CODE_TO_FIELD[err.code]) mapped[CODE_TO_FIELD[err.code]] = err.message
      setErrors(mapped)
      setFormError(Object.keys(mapped).length ? 'A few things need your attention.' : err.message)
    } finally {
      setBusy(false)
    }
  }

  if (phase === 'loading') return <p className="loading" role="status">Loading your listing…</p>
  if (phase === 'missing') {
    return (
      <div className="page auth">
        <div className="auth__head"><h1>We couldn’t find that listing</h1><p>It may have been removed.</p></div>
        <Link to="/vendor" className="btn">Back to my listings</Link>
      </div>
    )
  }

  return (
    <div className="page composer">
      <div className="panel composer__head">
        <Link to="/vendor" className="backlink">← My listings</Link>
        <h1>{editing ? 'Edit your listing' : 'Post surplus food'}</h1>
        <p className="hand">takes under a minute</p>
      </div>

      <div className="composer__grid">
        <form className="panel form composer__form" onSubmit={submit} noValidate>
          {formError && <p className="alert" role="alert">{formError}</p>}

          <Field label="What is it called?" error={errors.title}>
            {(p) => <input {...p} value={form.title} onChange={set('title')} maxLength={120} placeholder="Mixed pastry bag" />}
          </Field>

          <Field label="What is included?" error={errors.description} hint={`${form.description.length} / 1000`}>
            {(p) => <textarea {...p} rows={3} value={form.description} onChange={set('description')} maxLength={1000} placeholder="Five pieces baked this morning: croissant, danish and two buns." />}
          </Field>

          <fieldset className="choice">
            <legend>Type of food</legend>
            <div className="chips" role="group" aria-label="Type of food">
              {CATEGORY_OPTIONS.map((c) => (
                <button key={c.value} type="button" className="chip" aria-pressed={form.category === c.value} onClick={() => update({ category: c.value })}>{c.label}</button>
              ))}
            </div>
          </fieldset>

          <fieldset className="choice">
            <legend>Dietary notes <span>(optional)</span></legend>
            <div className="chips">
              {TAG_OPTIONS.map((t) => (
                <button key={t.value} type="button" className="chip" aria-pressed={form.dietaryTags.includes(t.value)} onClick={() => toggleTag(t.value)}>{t.label}</button>
              ))}
            </div>
          </fieldset>

          <fieldset className="pricing">
            <legend>Pricing</legend>
            <div className="form__row form__row--2">
              <Field label="Usual price" error={errors.originalPrice}>
                {(p) => (
                  <div className="money-input">
                    <span aria-hidden="true">{currencySymbol}</span>
                    <input {...p} type="number" inputMode="decimal" min="0" step="0.01" value={form.originalPrice} onChange={set('originalPrice')} placeholder="380" />
                  </div>
                )}
              </Field>
              <Field label="Rescue price" error={errors.rescuePrice}>
                {(p) => (
                  <div className="money-input">
                    <span aria-hidden="true">{currencySymbol}</span>
                    <input {...p} type="number" inputMode="decimal" min="0" step="0.01" value={form.rescuePrice} onChange={set('rescuePrice')} placeholder="99" />
                  </div>
                )}
              </Field>
            </div>
            <DiscountMeter original={original} rescue={rescue} onPick={(price) => update({ rescuePrice: String(price) })} />
          </fieldset>

          <Field label="Portions available" error={errors.quantity}>
            {(p) => (
              <div className="stepper">
                <button type="button" className="stepper__btn" aria-label="One fewer portion" onClick={() => update({ quantity: Math.max(1, Number(form.quantity) - 1) })}>−</button>
                <input {...p} type="number" inputMode="numeric" min="1" max="500" value={form.quantity} onChange={set('quantity')} />
                <button type="button" className="stepper__btn" aria-label="One more portion" onClick={() => update({ quantity: Math.min(500, Number(form.quantity) + 1) })}>+</button>
              </div>
            )}
          </Field>

          <fieldset className="choice">
            <legend>Pickup window</legend>
            <div className="chips" role="group" aria-label="Quick pickup windows">
              {WINDOW_PRESETS.map((w) => <button key={w.hours} type="button" className="chip" onClick={() => applyWindow(w.hours)}>{w.label}</button>)}
            </div>
            <div className="form__row form__row--2">
              <Field label="Pickup starts" error={errors.pickupStart}>
                {(p) => <input {...p} type="datetime-local" value={form.pickupStart} onChange={set('pickupStart')} />}
              </Field>
              <Field label="Pickup ends" error={errors.pickupEnd}>
                {(p) => <input {...p} type="datetime-local" value={form.pickupEnd} onChange={set('pickupEnd')} />}
              </Field>
            </div>
          </fieldset>

          <div className="composer__actions">
            <button className="btn" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Post this food'}</button>
            <Link to="/vendor" className="btn btn--ghost">Cancel</Link>
          </div>
        </form>

        <aside className="composer__preview" aria-label="Preview of your listing">
          <div className="panel preview">
            <h2>How customers will see it</h2>
            <FoodCard listing={preview} preview />
          </div>
        </aside>
      </div>
    </div>
  )
}
