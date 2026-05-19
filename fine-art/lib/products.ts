export interface ProductSize {
  label: string
  price: number
}

export interface Product {
  id: string
  name: string
  medium: string
  description: string
  sizes: ProductSize[]
  emoji: string
  color: string
}

export const products: Product[] = [
  {
    id: 'autumn-valley',
    name: 'Autumn Valley',
    medium: 'Oil on Canvas',
    description:
      'A sweeping view of a valley caught in peak autumn color. Painted in rich umbers, ochres, and deep shadow — the kind of day you remember years later.',
    sizes: [
      { label: 'Small (8″×10″)', price: 120 },
      { label: 'Medium (16″×20″)', price: 240 },
      { label: 'Large (24″×36″)', price: 480 },
    ],
    emoji: '🍂',
    color: '#C17F34',
  },
  {
    id: 'morning-fog',
    name: 'Morning Fog',
    medium: 'Wax (Encaustic)',
    description:
      'Hazy morning light filtered through encaustic layers — the landscape barely visible, more feeling than scene. Each layer of wax holds the light differently.',
    sizes: [
      { label: 'Small (8″×10″)', price: 90 },
      { label: 'Medium (16″×20″)', price: 180 },
      { label: 'Large (24″×36″)', price: 360 },
    ],
    emoji: '🌫️',
    color: '#B0A090',
  },
  {
    id: 'winter-creek',
    name: 'Winter Creek',
    medium: 'Oil on Canvas',
    description:
      'Ice-edged water threading through bare trees. Cool grays, faint blues, and the occasional flash of warm bark — winter as it actually looks, not a postcard.',
    sizes: [
      { label: 'Small (8″×10″)', price: 150 },
      { label: 'Medium (16″×20″)', price: 300 },
      { label: 'Large (24″×36″)', price: 600 },
    ],
    emoji: '❄️',
    color: '#7A9BAF',
  },
  {
    id: 'summer-fields',
    name: 'Summer Fields',
    medium: 'Wax (Encaustic)',
    description:
      'Wide open fields under a heavy summer sky. The encaustic wax picks up the warmth of the season — golden, a little hazy, unhurried.',
    sizes: [
      { label: 'Small (8″×10″)', price: 85 },
      { label: 'Medium (16″×20″)', price: 170 },
      { label: 'Large (24″×36″)', price: 340 },
    ],
    emoji: '🌾',
    color: '#C8A84B',
  },
  {
    id: 'golden-dusk',
    name: 'Golden Dusk',
    medium: 'Oil on Canvas',
    description:
      'The last half-hour of daylight on a hillside. Amber fading into shadow, painted in thick, confident strokes.',
    sizes: [
      { label: 'Small (8″×10″)', price: 135 },
      { label: 'Medium (16″×20″)', price: 270 },
      { label: 'Large (24″×36″)', price: 540 },
    ],
    emoji: '🌅',
    color: '#C4803A',
  },
  {
    id: 'birch-study',
    name: 'Birch Study',
    medium: 'Wax (Encaustic)',
    description:
      'A close, intimate study of birch bark. The encaustic wax brings out every crack and variation in the surface — earthy, quiet, tactile.',
    sizes: [
      { label: 'Small (8″×10″)', price: 95 },
      { label: 'Medium (16″×20″)', price: 190 },
      { label: 'Large (24″×36″)', price: 380 },
    ],
    emoji: '🌿',
    color: '#8A9E7A',
  },
]
