const pad = (n) => String(n).padStart(2, '0')

/** Date to the "YYYY-MM-DDTHH:mm" text a datetime-local input expects, in the viewer's own timezone. */
export function toLocalInput(date) {
  const d = new Date(date)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** A datetime-local value (local time) to the UTC ISO string the API expects. */
export function localInputToIso(value) {
  return new Date(value).toISOString()
}

export function roundUpToFiveMinutes(date = new Date()) {
  const d = new Date(date)
  d.setSeconds(0, 0)
  d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5)
  return d
}

const clock = new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })

function dayPrefix(date, now) {
  const startOfDay = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const diff = Math.round((startOfDay(date) - startOfDay(now)) / 86400000)
  if (diff <= 0) return ''
  if (diff === 1) return 'tomorrow '
  return `${date.toLocaleDateString('en-IN', { weekday: 'short' })} `
}

/** "Pick up 6:30 pm to 7:30 pm", "Pick up until 7:30 pm" once open, with a day when it is not today. */
export function pickupLabel(startIso, endIso, now = new Date()) {
  const start = new Date(startIso)
  const end = new Date(endIso)
  if (start <= now) return `Pick up until ${dayPrefix(end, now)}${clock.format(end)}`
  return `Pick up ${dayPrefix(start, now)}${clock.format(start)} to ${dayPrefix(end, now) === dayPrefix(start, now) ? '' : dayPrefix(end, now)}${clock.format(end)}`
}
