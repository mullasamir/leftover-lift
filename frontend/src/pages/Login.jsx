import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Field from '../components/Field.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const set = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await login(form)
      navigate(location.state?.from ?? '/discover', { replace: true })
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
        <h1>Welcome back</h1>
        <p>Sign in to reserve food or manage your listings.</p>
      </div>

      <form className="form" onSubmit={submit} noValidate>
        {error && !Object.keys(fields).length && <p className="alert" role="alert">{error.message}</p>}

        <Field label="Email" error={fields.email}>
          {(p) => <input {...p} type="email" autoComplete="email" value={form.email} onChange={set('email')} required />}
        </Field>
        <Field label="Password" error={fields.password}>
          {(p) => <input {...p} type="password" autoComplete="current-password" value={form.password} onChange={set('password')} required />}
        </Field>

        <button className="btn" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>

      <p className="auth__switch">New here? <Link to="/register">Create an account</Link></p>
    </div>
  )
}
