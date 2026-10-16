import { useId } from 'react'

/** A labelled range slider with its current value shown, used by the calculators. */
export default function SliderField({ label, value, onChange, min, max, step = 1, format = (v) => v }) {
  const id = useId()
  const fill = `${((value - min) / (max - min)) * 100}%`
  return (
    <div className="slider-field">
      <div className="calc__label">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id}>{format(value)}</output>
      </div>
      <input id={id} className="range" type="range" min={min} max={max} step={step} value={value} style={{ '--fill': fill }} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  )
}
