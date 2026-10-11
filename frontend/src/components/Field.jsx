import { useId } from 'react'

export default function Field({ label, error, hint, children }) {
  const id = useId()
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(' ') || undefined

  // The control is passed in as a render function so the label/aria wiring lives in one place.
  return (
    <div className={`field${error ? ' field--error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy })}
      {hint && !error && <p className="field__hint" id={`${id}-hint`}>{hint}</p>}
      {error && <p className="field__error" id={`${id}-error`}>{error}</p>}
    </div>
  )
}
