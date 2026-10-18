const dateTime = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true })
const dateOnly = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
const timeOnly = new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })

export const formatDateTime = (iso) => (iso ? dateTime.format(new Date(iso)) : '')
export const formatDate = (iso) => (iso ? dateOnly.format(new Date(iso)) : '')
export const formatTime = (iso) => (iso ? timeOnly.format(new Date(iso)) : '')
