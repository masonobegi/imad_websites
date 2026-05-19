export interface StickerProduct {
  id: string
  name: string
  description: string
  price: number
  packSize: string
  emoji: string
  color: string
}

export const products: StickerProduct[] = [
  {
    id: 'forest-friends',
    name: 'Forest Friends',
    description:
      'Six AI-illustrated woodland creatures — fox, deer, owl, rabbit, bear cub, and hedgehog. Vinyl, waterproof, slightly matte finish.',
    price: 8,
    packSize: '6-sticker pack',
    emoji: '🦊',
    color: '#A86030',
  },
  {
    id: 'cosmic-dreams',
    name: 'Cosmic Dreams',
    description:
      'Moon phases, constellations, planets, and a comet. Six dreamy space stickers with a soft illustrated look.',
    price: 8,
    packSize: '6-sticker pack',
    emoji: '🌙',
    color: '#4A3870',
  },
  {
    id: 'botanical-bloom',
    name: 'Botanical Bloom',
    description:
      'Illustrated botanicals — wildflowers, seed pods, ferns, and leaves. Six stickers in warm earth tones.',
    price: 7,
    packSize: '6-sticker pack',
    emoji: '🌸',
    color: '#A84060',
  },
  {
    id: 'mountain-spirits',
    name: 'Mountain Spirits',
    description:
      'Six illustrated mountain scenes — snow peaks, a log cabin, a trail sign, pine trees, and an alpine lake.',
    price: 8,
    packSize: '6-sticker pack',
    emoji: '🏔️',
    color: '#507080',
  },
  {
    id: 'ocean-whispers',
    name: 'Ocean Whispers',
    description:
      'Waves, shells, a lighthouse, a sea turtle, kelp, and a tide pool. Six ocean-themed stickers.',
    price: 7,
    packSize: '6-sticker pack',
    emoji: '🐚',
    color: '#3080A0',
  },
  {
    id: 'desert-sun',
    name: 'Desert Sun',
    description:
      'Saguaro cactus, a roadrunner, a mesa at sunset, desert blooms, a jackrabbit, and sunbaked earth. Six stickers.',
    price: 7,
    packSize: '6-sticker pack',
    emoji: '🌵',
    color: '#C07030',
  },
]
