export interface ProductSize {
  label: string
  price: number
}

export interface Product {
  id: string
  name: string
  category: string
  description: string
  sizes: ProductSize[]
  emoji: string
  color: string
}

export const products: Product[] = [
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    category: 'Landscape',
    description:
      'Warm afternoon light spreading across a quiet meadow, shot at the edge of the day. Printed on heavyweight matte archival paper.',
    sizes: [
      { label: 'Small (5″×7″ Print)', price: 35 },
      { label: 'Medium (11″×14″ Print)', price: 75 },
      { label: 'Large (20″×24″ Print)', price: 145 },
    ],
    emoji: '🌄',
    color: '#C8A440',
  },
  {
    id: 'mountain-mist',
    name: 'Mountain Mist',
    category: 'Landscape',
    description:
      'Morning fog wrapped low around the ridge, taken just before sunrise. The kind of shot that requires a cold early start and some patience.',
    sizes: [
      { label: 'Small (5″×7″ Print)', price: 40 },
      { label: 'Medium (11″×14″ Print)', price: 85 },
      { label: 'Large (20″×24″ Print)', price: 165 },
    ],
    emoji: '🏔️',
    color: '#8AA4B0',
  },
  {
    id: 'still-waters',
    name: 'Still Waters',
    category: 'Nature',
    description:
      'A glassy lake surface reflecting the early sky. Shot in the brief window between dark and daylight when the water is completely calm.',
    sizes: [
      { label: 'Small (5″×7″ Print)', price: 30 },
      { label: 'Medium (11″×14″ Print)', price: 65 },
      { label: 'Large (20″×24″ Print)', price: 125 },
    ],
    emoji: '🌊',
    color: '#6A8CA0',
  },
  {
    id: 'forest-floor',
    name: 'Forest Floor',
    category: 'Nature',
    description:
      'Fallen leaves, moss, and dappled light working together. An intimate photograph taken low to the ground in an old-growth stand.',
    sizes: [
      { label: 'Small (5″×7″ Print)', price: 35 },
      { label: 'Medium (11″×14″ Print)', price: 75 },
      { label: 'Large (20″×24″ Print)', price: 145 },
    ],
    emoji: '🍃',
    color: '#7A9E6A',
  },
  {
    id: 'city-at-dusk',
    name: 'City at Dusk',
    category: 'Urban',
    description:
      'Streetlights flickering on as the sky turns amber above the rooftops. Shot from a rooftop on a warm evening in late September.',
    sizes: [
      { label: 'Small (5″×7″ Print)', price: 45 },
      { label: 'Medium (11″×14″ Print)', price: 95 },
      { label: 'Large (20″×24″ Print)', price: 185 },
    ],
    emoji: '🌆',
    color: '#C47040',
  },
  {
    id: 'storm-light',
    name: 'Storm Light',
    category: 'Sky',
    description:
      'A break in the storm clouds lets through one shaft of evening light over open land. Caught by staying out too long.',
    sizes: [
      { label: 'Small (5″×7″ Print)', price: 40 },
      { label: 'Medium (11″×14″ Print)', price: 85 },
      { label: 'Large (20″×24″ Print)', price: 165 },
    ],
    emoji: '⛅',
    color: '#9090A8',
  },
]
