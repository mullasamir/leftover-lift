// Mirrors Pricing.java on the server so the vendor sees the discount while typing.
// The server recalculates it from the two prices, so this is only ever a preview.
export function discountPercent(original, rescue) {
  if (!Number.isFinite(original) || !Number.isFinite(rescue) || original <= 0) return 0
  const pct = Math.round(((original - rescue) / original) * 100)
  return Math.max(0, Math.min(100, pct))
}

export function savings(original, rescue) {
  if (!Number.isFinite(original) || !Number.isFinite(rescue)) return 0
  return Math.max(0, original - rescue)
}

/** The rescue price that gives `percent` off, kept to whole units when the usual price is whole. */
export function priceForDiscount(original, percent) {
  const raw = original * (1 - percent / 100)
  return Number.isInteger(original) ? Math.round(raw) : Number(raw.toFixed(2))
}
