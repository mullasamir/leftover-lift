import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Field from '../components/Field.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const BUSINESS_TYPES = [
  ['BAKERY', 'Bakery'], ['RESTAURANT', 'Restaurant'], ['CAFE', 'Café'], ['GROCERY', 'Grocery store'],
  ['HOTEL', 'Hotel'], ['CATERER', 'Caterer'], ['OTHER', 'Something else'],
]

const emptyVendor = { businessName: '', businessType: '', address: '', city: '', state: '', zipCode: '' }

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [role, setRole] = useState(params.get('role') === 'VENDOR' ? 'VENDOR' : 'CONSUMER')
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '' })
  const [vendor, setVendor] = useState(emptyVendor)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const set = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }))
  const setV = (name) => (e) => setVendor((v) => ({ ...v, [name]: e.target.value }))
  const isVendor = role === 'VENDOR'

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const payload = { ...form, role, phone: form.phone || null, vendor: isVendor ? vendor : null }
      const user = await register(payload)
      navigate(user.role === 'VENDOR' ? '/account' : '/discover', { replace: true })
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  const fields = error?.fieldErrors ?? {}

  return (
    <div className="page auth">
      <div className="auth__head">
        <h1>Join Leftover Lift</h1>
        <p>{isVendor ? 'Turn what is left at closing time into income.' : 'Get good food nearby at a fraction of the price.'}</p>
      </div>

      <form className="form" onSubmit={submit} noValidate>
        <div className="role-toggle" role="group" aria-label="How will you use Leftover Lift?">
          <button type="button" aria-pressed={!isVendor} onClick={() => setRole('CONSUMER')}>I want to rescue food</button>
          <button type="button" aria-pressed={isVendor} onClick={() => setRole('VENDOR')}>I run a food business</button>
        </div>

        {error && <p className="alert" role="alert">{error.message}</p>}

        <Field label="Your name" error={fields.fullName}>
          {(p) => <input {...p} autoComplete="name" value={form.fullName} onChange={set('fullName')} required />}
        </Field>
        <Field label="Email" error={fields.email}>
          {(p) => <input {...p} type="email" autoComplete="email" value={form.email} onChange={set('email')} required />}
        </Field>
        <Field label="Password" hint="At least 8 characters." error={fields.password}>
          {(p) => <input {...p} type="password" autoComplete="new-password" value={form.password} onChange={set('password')} required />}
        </Field>
        <Field label="Phone (optional)" hint="Only used to coordinate pickups." error={fields.phone}>
          {(p) => <input {...p} type="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} />}
        </Field>

        {isVendor && (
          <fieldset className="vendor-fields" style={{ margin: 0, minWidth: 0 }}>
            <legend className="visually-hidden">Business details</legend>
            <Field label="Business name" error={fields['vendor.businessName']}>
              {(p) => <input {...p} value={vendor.businessName} onChange={setV('businessName')} required />}
            </Field>
            <Field label="Type of business" error={fields['vendor.businessType']}>
              {(p) => (
                <select {...p} value={vendor.businessType} onChange={setV('businessType')} required>
                  <option value="" disabled>Choose one</option>
                  {BUSINESS_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              )}
            </Field>
            <Field label="Pickup address" error={fields['vendor.address']}>
              {(p) => <input {...p} autoComplete="street-address" value={vendor.address} onChange={setV('address')} required />}
            </Field>
            <div className="form__row form__row--2">
              <Field label="City" error={fields['vendor.city']}>
                {(p) => <input {...p} autoComplete="address-level2" value={vendor.city} onChange={setV('city')} required />}
              </Field>
              <Field label="State" error={fields['vendor.state']}>
                {(p) => <input {...p} autoComplete="address-level1" value={vendor.state} onChange={setV('state')} required />}
              </Field>
            </div>
            <Field label="Zip code" error={fields['vendor.zipCode']}>
              {(p) => <input {...p} autoComplete="postal-code" value={vendor.zipCode} onChange={setV('zipCode')} required />}
            </Field>
          </fieldset>
        )}

        <button className="btn" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
      </form>

      <p className="auth__switch">Already have an account? <Link to="/login">Sign in</Link></p>
    </div>
  )
}
