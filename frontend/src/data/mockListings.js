// Sample listings so the app feels alive before vendors can post (Phase 2 replaces this with the API).
const inMinutes = (m) => Date.now() + m * 60 * 1000

export const CATEGORIES = [
  { id: 'all', label: 'Everything' },
  { id: 'bakery', label: 'Bakery' },
  { id: 'meals', label: 'Hot meals' },
  { id: 'cafe', label: 'Café' },
  { id: 'grocery', label: 'Groceries' },
]

export const sampleListings = [
  {
    id: 's1', category: 'bakery', vendor: 'Crumb & Co. Bakery', distance: '0.4 km',
    title: 'Mixed pastry bag', detail: 'Five pieces, baked this morning',
    tags: ['Vegetarian', 'Contains gluten'], left: 3,
    price: 99, originalPrice: 380, pickup: 'Pick up 6:30 to 7:30 pm',
    closesAt: inMinutes(74), windowMinutes: 240,
  },
  {
    id: 's2', category: 'meals', vendor: 'Saffron Table', distance: '1.1 km',
    title: 'Paneer curry with rice', detail: 'Two portions, still warm',
    tags: ['Vegetarian', 'Spicy'], left: 2,
    price: 129, originalPrice: 420, pickup: 'Pick up 8:00 to 9:00 pm',
    closesAt: inMinutes(22), windowMinutes: 180,
  },
  {
    id: 's3', category: 'cafe', vendor: 'Little Loom Café', distance: '0.8 km',
    title: 'Sandwich and a cold brew', detail: 'Today’s sandwiches plus one drink',
    tags: ['Contains dairy'], left: 4,
    price: 119, originalPrice: 320, pickup: 'Pick up 5:00 to 6:00 pm',
    closesAt: inMinutes(190), windowMinutes: 360,
  },
  {
    id: 's4', category: 'grocery', vendor: 'Greenbasket Market', distance: '1.6 km',
    title: 'Surprise veg box', detail: 'About 3 kg of seasonal vegetables',
    tags: ['Vegan', 'Seasonal'], left: 5,
    price: 149, originalPrice: 400, pickup: 'Pick up 7:00 to 8:30 pm',
    closesAt: inMinutes(135), windowMinutes: 300,
  },
  {
    id: 's5', category: 'bakery', vendor: 'Rye & Rise', distance: '2.0 km',
    title: 'Two sourdough loaves', detail: 'Day-old, great for toast',
    tags: ['Vegan', 'Contains gluten'], left: 2,
    price: 99, originalPrice: 320, pickup: 'Pick up 6:00 to 7:00 pm',
    closesAt: inMinutes(48), windowMinutes: 240,
  },
  {
    id: 's6', category: 'meals', vendor: 'Harbour Kitchen', distance: '2.4 km',
    title: 'Dinner for two', detail: 'Chef’s choice from tonight’s menu',
    tags: ['Chef’s choice'], left: 1,
    price: 199, originalPrice: 700, pickup: 'Pick up 9:00 to 9:45 pm',
    closesAt: inMinutes(260), windowMinutes: 420,
  },
]

export const discountPercent = (l) => Math.round((1 - l.price / l.originalPrice) * 100)
