/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()
const pub = path.join(__dirname, '..', 'public')

async function main() {
  const alreadySeeded = (await prisma.fineArtWork.count()) > 0
  if (alreadySeeded) {
    console.log('Database already seeded — skipping.')
    return
  }

  console.log('Seeding database from public/ JSON files...')

  // ── Fine Art ──────────────────────────────────────────────────────────────
  const fineArtData = JSON.parse(fs.readFileSync(path.join(pub, 'fine-art', 'data.json'), 'utf-8'))

  let sortOrder = 0
  for (const w of fineArtData.works.watercolors || []) {
    await prisma.fineArtWork.create({
      data: {
        id: w.id,
        type: 'watercolor',
        filename: w.filename,
        title: w.title,
        description: w.description || '',
        originalSize: w.originalSize ?? null,
        available: w.available ?? false,
        price: w.price ?? null,
        sortOrder: sortOrder++,
      },
    })
  }

  sortOrder = 0
  for (const w of fineArtData.works.encaustics || []) {
    await prisma.fineArtWork.create({
      data: {
        id: w.id,
        type: 'encaustic',
        filename: w.filename,
        title: w.title,
        description: w.description || '',
        originalSize: w.originalSize ?? null,
        available: w.available ?? false,
        price: w.price ?? null,
        sortOrder: sortOrder++,
      },
    })
  }

  sortOrder = 0
  for (const w of fineArtData.works.oils || []) {
    await prisma.fineArtWork.create({
      data: {
        id: w.id,
        type: 'oil',
        filename: w.filename,
        title: w.title,
        description: w.description || '',
        originalSize: w.originalSize ?? null,
        available: w.available ?? false,
        originalPrice: w.originalPrice ?? null,
        reprintAvailable: w.reprintAvailable ?? false,
        reprintPrice: w.reprintPrice ?? null,
        awardTitle: w.award?.title ?? null,
        awardUrl: w.award?.url ?? null,
        sortOrder: sortOrder++,
        pleinAirImages: {
          create: (w.pleinAirImages || []).map((p, i) => ({
            id: p.id,
            filename: p.filename,
            title: p.title,
            sortOrder: i,
          })),
        },
      },
    })
  }

  // ── Photos ────────────────────────────────────────────────────────────────
  const photosData = JSON.parse(fs.readFileSync(path.join(pub, 'photos', 'data.json'), 'utf-8'))

  let catOrder = 0
  for (const [slug, cat] of Object.entries(photosData.categories)) {
    await prisma.photoCategory.create({
      data: {
        slug,
        label: cat.label,
        description: cat.description || '',
        sortOrder: catOrder++,
      },
    })
    let photoOrder = 0
    for (const p of photosData.photos[slug] || []) {
      await prisma.photo.create({
        data: {
          id: p.id,
          filename: p.filename,
          title: p.title,
          description: p.description || '',
          category: slug,
          sortOrder: photoOrder++,
        },
      })
    }
  }

  // ── Print Sizes ────────────────────────────────────────────────────────────
  const config = JSON.parse(fs.readFileSync(path.join(pub, 'photos', 'config.json'), 'utf-8'))
  for (let i = 0; i < (config.printSizes || []).length; i++) {
    const s = config.printSizes[i]
    await prisma.printSize.create({ data: { label: s.label, price: s.price, sortOrder: i } })
  }

  // ── Stickers ──────────────────────────────────────────────────────────────
  const stickersDir = path.join(pub, 'stickers')
  if (fs.existsSync(stickersDir)) {
    const files = fs.readdirSync(stickersDir)
      .filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f))
      .sort()
    for (let i = 0; i < files.length; i++) {
      await prisma.sticker.create({ data: { filename: files[i], sortOrder: i } })
    }
  }

  // ── Site Config ────────────────────────────────────────────────────────────
  const defaultConfig = {
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

  // Try to load existing site-config.json if present
  let siteConfig = defaultConfig
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(pub, 'site-config.json'), 'utf-8'))
    siteConfig = {
      homepage: { ...defaultConfig.homepage, ...(raw.homepage || {}) },
      featuredPhotos: raw.featuredPhotos ?? defaultConfig.featuredPhotos,
      featuredFineArt: raw.featuredFineArt ?? defaultConfig.featuredFineArt,
      social: { ...defaultConfig.social, ...(raw.social || {}) },
      contact: { ...defaultConfig.contact, ...(raw.contact || {}) },
    }
  } catch {
    // Use defaults
  }

  await prisma.siteConfig.create({ data: { key: 'main', value: JSON.stringify(siteConfig) } })

  console.log('Seeding complete.')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
