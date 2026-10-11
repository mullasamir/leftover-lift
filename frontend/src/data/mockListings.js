// Sample listings so the browse experience works before vendors can post (Phase 2 replaces this with the API).
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
    title: 'Mixed pastry bag', detail: '5 pieces, baked this morning',
    price: 3.5, originalPrice: 14, pickup: 'Pick up 6:30 – 7:30 pm',
    closesAt: inMinutes(74), windowMinutes: 240,
  },
  {
    id: 's2', category: 'meals', vendor: 'Saffron Table', distance: '1.1 km',
    title: 'Paneer curry with rice', detail: 'Two portions, vegetarian',
    price: 4.2, originalPrice: 15, pickup: 'Pick up 8:00 – 9:00 pm',
    closesAt: inMinutes(22), windowMinutes: 180,
  },
  {
    id: 's3', category: 'cafe', vendor: 'Little Loom Café', distance: '0.8 km',
    title: 'Sandwich and a cold brew', detail: 'Today’s sandwiches, one drink',
    price: 3.9, originalPrice: 11, pickup: 'Pick up 5:00 – 6:00 pm',
    closesAt: inMinutes(190), windowMinutes: 360,
  },
  {
    id: 's4', category: 'grocery', vendor: 'Greenbasket Market', distance: '1.6 km',
    title: 'Surprise veg box', detail: 'About 3 kg of seasonal vegetables',
    price: 4.0, originalPrice: 12, pickup: 'Pick up 7:00 – 8:30 pm',
    closesAt: inMinutes(135), windowMinutes: 300,
  },
  {
    id: 's5', category: 'bakery', vendor: 'Rye & Rise', distance: '2.0 km',
    title: 'Two sourdough loaves', detail: 'Day-old, great for toast',
    price: 3.0, originalPrice: 10, pickup: 'Pick up 6:00 – 7:00 pm',
    closesAt: inMinutes(48), windowMinutes: 240,
  },
  {
    id: 's6', category: 'meals', vendor: 'Harbour Kitchen', distance: '2.4 km',
    title: 'Dinner for two', detail: 'Chef’s choice, still warm',
    price: 6.5, originalPrice: 24, pickup: 'Pick up 9:00 – 9:45 pm',
    closesAt: inMinutes(260), windowMinutes: 420,
  },
]
