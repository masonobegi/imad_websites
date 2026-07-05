import { prisma } from './prisma'

export interface SiteConfig {
  homepage: {
    heroHeadline: string
    heroSubtext: string
    heroPhotoId: string
    photoStripHeadline: string
    photoStripSubtext: string
    fineArtHeadline: string
    fineArtSubtext: string
    commissionOpen: boolean
    commissionHeadline: string
    commissionBody: string
    commissionCta: string
    welcomeVisible: boolean
    welcomeText: string
  }
  stickers: {
    heading: string
    intro: string
  }
  digitalDesign: {
    intro: string
  }
  commissions: {
    formIntro: string
  }
  encaustics: {
    headerText: string
  }
  featuredPhotos: string[]
  featuredFineArt: { id: string; type: 'watercolor' | 'encaustic' | 'oil' }[]
  social: { instagram: string; facebook: string }
  contact: { ownerEmail: string }
}

export const DEFAULT_CONFIG: SiteConfig = {
  homepage: {
    heroHeadline: 'Imad Obegi',
    heroSubtext: 'Artist · Photographer · OBGillustrator.com',
    heroPhotoId: 'milky-way-over-joshua-tree',
    photoStripHeadline: 'Photography',
    photoStripSubtext: 'Nature, wildlife, and the San Francisco Bay · Metal & canvas prints',
    fineArtHeadline: 'Fine Art',
    fineArtSubtext: 'Watercolors, oil paintings & encaustics · Originals & prints',
    commissionOpen: true,
    commissionHeadline: 'Have something in mind?',
    commissionBody: "Imad Obegi takes commissions — watercolors, encaustics, prints, and custom designs. Tell him what you're envisioning and he'll be in touch.",
    commissionCta: 'Commission a Piece',
    welcomeVisible: false,
    welcomeText: "Welcome to my website. I've been a passionate artist for most of my life. Over the past few decades, I have honed my craft in encaustic art, photography, watercolor, and fine art. I'm excited to share my portfolio of custom and off-the-shelf artwork with you. My mission is to provide art pieces that resonate with your personal style and taste, for your home, or any space you are creating.",
  },
  stickers: {
    heading: 'Original Character Designs',
    intro: 'These 3" × 3" vinyl stickers are an easy way to decorate your drink containers, car, computer, or other items. Be proud of activities that interest you, fondly remember the places you have visited, and are great conversation starters. Printed on thick, durable vinyl, they\'re weatherproof & waterproof. I can create a custom sticker for you or your business. Contact me using the custom form.',
  },
  digitalDesign: {
    intro: 'At OBG Illustrator, we pride ourselves on delivering exceptional graphic design solutions tailored to each client\'s vision. As a full-service design agency, we collaborate closely with our clients to develop unique and impactful designs — whether from scratch or by refining existing concepts. Led by award-winning designer Imad Obegi, we combine traditional artistry with advanced digital techniques to ensure every project exceeds expectations. With a proven track record, competitive pricing, and a commitment to excellence, OBG Illustrator guarantees a seamless process and outstanding results.',
  },
  commissions: {
    formIntro: "Tell Imad what you have in mind — a watercolor of a place you love, an encaustic for a special occasion, a custom print, or something else entirely. He'll reach out to discuss and get you a quote.",
  },
  encaustics: {
    headerText: 'Shop one of a kind encaustic art pieces. I take commissions. If you saw an encaustic on the gallery page that you liked and it is not available on the purchase page, please send me a note to recreate a similar piece or I can create a custom encaustic for you.',
  },
  featuredPhotos: [
    'delicate-arch-at-dawn', 'dahlia-symphony', 'the-lone-cypress',
    'milky-way-over-hidden-valley', 'golden-gate-in-the-mist', 'bay-of-gold',
  ],
  featuredFineArt: [
    { id: 'the-crab-shack-salter-path', type: 'watercolor' },
    { id: 'autumn-arrival-engine-no-3', type: 'watercolor' },
    { id: 'fields-of-mustard', type: 'encaustic' },
    { id: 'wooden-shoe-tulip-festival', type: 'oil' },
    { id: 'peacock-on-display', type: 'encaustic' },
    { id: 'south-falls', type: 'oil' },
  ],
  social: {
    instagram: 'https://www.instagram.com/imadobegi/',
    facebook: 'https://www.facebook.com/imad.obegi/',
  },
  contact: { ownerEmail: 'imadobegi@gmail.com' },
}

export async function readSiteConfig(): Promise<SiteConfig> {
  try {
    const row = await prisma.siteConfig.findUnique({ where: { key: 'main' } })
    if (!row) return DEFAULT_CONFIG
    const raw = JSON.parse(row.value)
    return {
      homepage: { ...DEFAULT_CONFIG.homepage, ...(raw.homepage || {}) },
      stickers: { ...DEFAULT_CONFIG.stickers, ...(raw.stickers || {}) },
      digitalDesign: { ...DEFAULT_CONFIG.digitalDesign, ...(raw.digitalDesign || {}) },
      commissions: { ...DEFAULT_CONFIG.commissions, ...(raw.commissions || {}) },
      encaustics: { ...DEFAULT_CONFIG.encaustics, ...(raw.encaustics || {}) },
      featuredPhotos: raw.featuredPhotos ?? DEFAULT_CONFIG.featuredPhotos,
      featuredFineArt: raw.featuredFineArt ?? DEFAULT_CONFIG.featuredFineArt,
      social: { ...DEFAULT_CONFIG.social, ...(raw.social || {}) },
      contact: { ...DEFAULT_CONFIG.contact, ...(raw.contact || {}) },
    }
  } catch {
    return DEFAULT_CONFIG
  }
}

export async function writeSiteConfig(config: SiteConfig): Promise<void> {
  await prisma.siteConfig.upsert({
    where: { key: 'main' },
    update: { value: JSON.stringify(config) },
    create: { key: 'main', value: JSON.stringify(config) },
  })
}
