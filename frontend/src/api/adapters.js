import { pickupLabel } from '../lib/time.js'

export const CATEGORY_OPTIONS = [
  { value: 'BAKERY', label: 'Bakery' },
  { value: 'MEALS', label: 'Hot meals' },
  { value: 'CAFE', label: 'Café' },
  { value: 'GROCERY', label: 'Groceries' },
]

export const TAG_OPTIONS = [
  { value: 'VEGETARIAN', label: 'Vegetarian' },
  { value: 'VEGAN', label: 'Vegan' },
  { value: 'HALAL', label: 'Halal' },
  { value: 'GLUTEN_FREE', label: 'Gluten free' },
  { value: 'CONTAINS_GLUTEN', label: 'Contains gluten' },
  { value: 'CONTAINS_DAIRY', label: 'Contains dairy' },
  { value: 'CONTAINS_NUTS', label: 'Contains nuts' },
  { value: 'SPICY', label: 'Spicy' },
]

const TAG_LABELS = Object.fromEntries(TAG_OPTIONS.map((t) => [t.value, t.label]))
export const categoryLabel = (value) => CATEGORY_OPTIONS.find((c) => c.value === value)?.label ?? value

export const STATUS_LABELS = { AVAILABLE: 'Live', SOLD_OUT: 'Sold out', EXPIRED: 'Ended', CANCELLED: 'Cancelled' }

/** Turns an API listing into the shape FoodCard draws. */
export function toCardListing(l) {
  const start = Date.parse(l.pickupStart)
  const end = Date.parse(l.pickupEnd)
  return {
    id: l.id,
    category: l.category.toLowerCase(),
    vendor: l.vendor.businessName,
    place: l.vendor.city,
    address: l.vendor.address,
    title: l.title,
    detail: l.description,
    tags: (l.dietaryTags ?? []).map((t) => TAG_LABELS[t] ?? t),
    left: l.quantityRemaining,
    price: Number(l.rescuePrice),
    originalPrice: Number(l.originalPrice),
    discount: l.discountPercent,
    pickup: pickupLabel(l.pickupStart, l.pickupEnd),
    closesAt: end,
    windowMinutes: Math.max(15, Math.round((end - start) / 60000)),
  }
}
