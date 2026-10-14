// All prices are shown in Indian rupees. To support another currency, change CURRENCY (and the sample data).
const CURRENCY = 'INR'

const formatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: CURRENCY, minimumFractionDigits: 0, maximumFractionDigits: 2 })

export const formatMoney = (amount) => formatter.format(amount)
export const currencySymbol = formatter.formatToParts(0).find((p) => p.type === 'currency')?.value ?? ''
