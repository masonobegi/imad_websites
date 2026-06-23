import fs from 'fs'
import path from 'path'
import { getDataPath } from './dataDir'

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

export function readSiteConfig(): SiteConfig {
  try {
    const raw = JSON.parse(fs.readFileSync(getDataPath('site-config.json'), 'utf-8'))
    return {
      homepage: { ...DEFAULT_CONFIG.homepage, ...(raw.homepage || {}) },
      featuredPhotos: raw.featuredPhotos ?? DEFAULT_CONFIG.featuredPhotos,
      featuredFineArt: raw.featuredFineArt ?? DEFAULT_CONFIG.featuredFineArt,
      social: { ...DEFAULT_CONFIG.social, ...(raw.social || {}) },
      contact: { ...DEFAULT_CONFIG.contact, ...(raw.contact || {}) },
    }
  } catch {
    return DEFAULT_CONFIG
  }
}

export function writeSiteConfig(config: SiteConfig): void {
  fs.writeFileSync(getDataPath('site-config.json'), JSON.stringify(config, null, 2), 'utf-8')
}
