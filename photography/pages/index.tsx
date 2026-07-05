import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { GetServerSideProps } from 'next'
import Layout from '../components/Layout'
import PhotoModal from '../components/PhotoModal'
import WorkModal, { Work } from '../components/WorkModal'
import OilModal, { OilWork } from '../components/OilModal'
import CartPopup from '../components/CartPopup'
import { Photo } from '../lib/photos'
import { SiteConfig } from '../lib/siteConfig'

interface FeaturedArt { id: string; type: 'watercolor' | 'encaustic' | 'oil'; imgPath: string; title: string }

interface PrintSize { label: string; price: number }

interface Props {
  heroPhoto: Photo
  previewPhotos: Photo[]
  allPhotos: Record<string, Photo[]>
  allOils: OilWork[]
  allWatercolors: Work[]
  allEncaustics: Work[]
  featuredFineArt: FeaturedArt[]
  previewStickers: string[]
  siteConfig: SiteConfig['homepage']
  printSizes: PrintSize[]
}

export default function Home({ heroPhoto, previewPhotos, allPhotos, allOils, allWatercolors, allEncaustics, featuredFineArt, previewStickers, siteConfig, printSizes }: Props) {
  const [modalState, setModalState] = useState<{ photos: Photo[]; index: number } | null>(null)
  const [workModalState, setWorkModalState] = useState<{ works: Work[], index: number, category: string, categoryLabel: string } | null>(null)
  const [oilModalIndex, setOilModalIndex] = useState<number | null>(null)
  const [cartOpen, setCartOpen] = useState(false)

  const openPhoto = (photo: Photo) => {
    const arr: Photo[] = allPhotos[photo.category] || []
    const idx = arr.findIndex(p => p.id === photo.id)
    setModalState({ photos: arr, index: idx >= 0 ? idx : 0 })
  }

  const openFeaturedWork = (item: FeaturedArt) => {
    if (item.type === 'watercolor') {
      const idx = allWatercolors.findIndex(w => w.id === item.id)
      if (idx >= 0) setWorkModalState({ works: allWatercolors, index: idx, category: 'watercolors', categoryLabel: 'Watercolors' })
    } else if (item.type === 'encaustic') {
      const idx = allEncaustics.findIndex(w => w.id === item.id)
      if (idx >= 0) setWorkModalState({ works: allEncaustics, index: idx, category: 'encaustics', categoryLabel: 'Encaustics' })
    } else if (item.type === 'oil') {
      const idx = allOils.findIndex(w => w.id === item.id)
      if (idx >= 0) setOilModalIndex(idx)
    }
  }

  return (
    <Layout>
      <Head>
        <title>Imad Obegi | Fine Art Photography Prints | OBGillustrator.com</title>
        <meta name="description" content="Photography prints by Imad Obegi — nature, wildlife, and the San Francisco Bay. Printed on archival metal or canvas. Made to order, ships flat." />
        <meta property="og:title" content="Imad Obegi | Fine Art Photography Prints" />
        <meta property="og:description" content="Nature, wildlife, and the San Francisco Bay — fine art prints on metal or canvas by Imad Obegi." />
        <meta property="og:image" content="https://obgillustrator.com/photos/nature/milky-way-over-joshua-tree.jpg" />
      </Head>

      {/* ── HERO ── */}
      <section className="relative h-[65vh] sm:h-[78vh] overflow-hidden photo-wrapper">
        <img
          src={`/photos/${heroPhoto.category}/${heroPhoto.filename}`}
          alt="Imad Obegi Photography"
          className="absolute inset-0 w-full h-full object-cover photo-protected"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-12 pb-8 sm:pb-14">
          <h1 className="font-serif text-5xl sm:text-7xl text-white leading-none mb-2">{siteConfig.heroHeadline}</h1>
          <p className="text-white/65 text-sm sm:text-base tracking-wide">{siteConfig.heroSubtext}</p>
        </div>
      </section>

      {/* ── WELCOME ── */}
      {siteConfig.welcomeVisible && siteConfig.welcomeText && (
        <section className="px-6 sm:px-12 py-10 sm:py-14 text-center border-b border-edge">
          <p className="font-serif text-ink text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">{siteConfig.welcomeText}</p>
        </section>
      )}

      {/* ── PHOTOGRAPHY ── */}
      <section className="border-b border-edge">
        <div className="px-6 sm:px-10 py-6 flex items-center justify-between border-b border-edge">
          <div>
            <p className="text-[10px] text-copper uppercase tracking-[0.2em] mb-1.5">Shop</p>
            <Link href="/shop"><h2 className="font-serif text-3xl sm:text-4xl text-ink hover:text-copper transition-colors">{siteConfig.photoStripHeadline}</h2></Link>
            <p className="text-mist text-sm mt-1 hidden sm:block">{siteConfig.photoStripSubtext}</p>
          </div>
          <Link
            href="/shop"
            className="flex items-center gap-2 text-copper text-sm flex-shrink-0 ml-6 hover:gap-3 transition-all duration-200"
          >
            <span className="hidden sm:inline">Browse All Photography</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="flex overflow-x-auto sm:overflow-hidden sm:grid sm:grid-cols-6 gap-2 bg-white">
          {previewPhotos.map(photo => (
            <Link
              key={photo.id}
              href="/shop"
              className="group/photo flex-shrink-0 w-44 sm:w-auto h-48 sm:h-56 overflow-hidden photo-wrapper block relative text-left focus:outline-none touch-manipulation"
              aria-label={`View ${photo.title}`}
            >
              <img
                src={`/photos/${photo.category}/${photo.filename}`}
                alt={photo.title}
                className="w-full h-full object-cover group-hover/photo:scale-105 transition-transform duration-500 photo-protected"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover/photo:bg-black/35 transition-colors duration-300 flex items-end">
                <p className="opacity-0 group-hover/photo:opacity-100 transition-opacity duration-300 text-white text-xs px-3 pb-3 leading-snug">
                  {photo.title}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="sm:hidden px-6 py-3 flex items-center justify-between">
          <p className="text-mist text-xs">Tap a photo to order a print</p>
          <Link href="/shop" className="text-copper text-xs">Browse all →</Link>
        </div>
      </section>

      {/* ── FINE ART ── */}
      <section className="border-b border-edge">
        <div className="px-6 sm:px-10 py-6 flex items-center justify-between border-b border-edge">
          <div>
            <p className="text-[10px] text-copper uppercase tracking-[0.2em] mb-1.5">Shop</p>
            <Link href="/fine-art"><h2 className="font-serif text-3xl sm:text-4xl text-ink hover:text-copper transition-colors">{siteConfig.fineArtHeadline}</h2></Link>
            <p className="text-mist text-sm mt-1 hidden sm:block">{siteConfig.fineArtSubtext}</p>
          </div>
          <Link
            href="/fine-art"
            className="flex items-center gap-2 text-copper text-sm flex-shrink-0 ml-6 hover:gap-3 transition-all duration-200"
          >
            <span className="hidden sm:inline">Browse All Fine Art</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="flex overflow-x-auto sm:overflow-hidden sm:grid sm:grid-cols-6 gap-2 bg-edge">
          {featuredFineArt.map(item => (
            <Link
              key={item.id}
              href={`/fine-art/${item.type}s`}
              className="group/art flex-shrink-0 w-44 sm:w-auto h-48 sm:h-56 overflow-hidden block relative text-left focus:outline-none touch-manipulation"
              aria-label={`View ${item.title}`}
            >
              <img
                src={item.imgPath}
                alt={item.title}
                className="w-full h-full object-cover group-hover/art:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover/art:bg-black/35 transition-colors duration-300 flex items-end">
                <p className="opacity-0 group-hover/art:opacity-100 transition-opacity duration-300 text-white text-xs px-3 pb-3 leading-snug">
                  {item.title}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="sm:hidden px-6 py-3 flex items-center justify-between">
          <p className="text-mist text-xs">Tap a work to learn more</p>
          <Link href="/fine-art" className="text-copper text-xs">Browse All Fine Art →</Link>
        </div>
      </section>

      {/* ── STICKERS ── */}
      <section className="border-b border-edge">
        <div className="px-6 sm:px-10 py-6 flex items-center justify-between border-b border-edge">
          <div>
            <p className="text-[10px] text-copper uppercase tracking-[0.2em] mb-1.5">Shop</p>
            <Link href="/stickers"><h2 className="font-serif text-3xl sm:text-4xl text-ink hover:text-copper transition-colors">Stickers</h2></Link>
            <p className="text-mist text-sm mt-1 hidden sm:block">Original designs · via Sticker Mule</p>
          </div>
          <Link
            href="/stickers"
            className="flex items-center gap-2 text-copper text-sm flex-shrink-0 ml-6 hover:gap-3 transition-all duration-200"
          >
            <span className="hidden sm:inline">Browse All Stickers</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="flex overflow-x-auto sm:overflow-hidden sm:grid sm:grid-cols-6 gap-2 bg-canvas">
          {previewStickers.map(filename => (
            <Link
              key={filename}
              href="/stickers"
              className="group/sticker flex-shrink-0 w-44 sm:w-auto h-48 sm:h-56 overflow-hidden block relative bg-canvas flex items-center justify-center"
            >
              <img
                src={`/stickers/${filename}`}
                alt={filename.replace(/\.[^.]+$/, '').replace(/-/g, ' ')}
                className="w-full h-full object-contain p-4 group-hover/sticker:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </Link>
          ))}
        </div>

        <div className="sm:hidden px-6 py-3 flex items-center justify-between">
          <p className="text-mist text-xs">Original designs by Imad Obegi</p>
          <Link href="/stickers" className="text-copper text-xs">Browse All Stickers →</Link>
        </div>
      </section>

      {/* ── DIGITAL ── */}
      <section className="border-b border-edge">
        <div className="px-6 sm:px-10 py-6 flex items-center justify-between border-b border-edge">
          <div>
            <p className="text-[10px] text-copper uppercase tracking-[0.2em] mb-1.5">Portfolio</p>
            <Link href="/digital"><h2 className="font-serif text-3xl sm:text-4xl text-ink hover:text-copper transition-colors">Digital Design</h2></Link>
            <p className="text-mist text-sm mt-1 hidden sm:block">Logos, posters &amp; brand illustrations</p>
          </div>
          <Link
            href="/digital"
            className="flex items-center gap-2 text-copper text-sm flex-shrink-0 ml-6 hover:gap-3 transition-all duration-200"
          >
            <span className="hidden sm:inline">Browse Digital</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="px-4 sm:px-6 py-6 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 bg-canvas">
          {[
            {
              id: 'jazz',
              src: '/fine-art/oils/rhythms-of-leimert-park.jpg',
              title: 'Jazz Festival',
              desc: 'Winning poster — 5th Annual Leimert Park Jazz Festival',
              externalUrl: 'https://www.leimertparkjazzfestival.org/2024-art-competition',
            },
            {
              id: 'notaries',
              src: '/digital/notaries-of-the-realm.jpg',
              title: 'Notaries of the Realm',
              desc: 'Logo design for a notary services firm',
            },
            {
              id: 'gumbo',
              src: '/digital/green-apples-gumbo.jpg',
              title: 'Green Apples Gumbo',
              desc: 'Brand identity for a catering & food business',
            },
            {
              id: 'matchfoot',
              src: '/digital/matchfoot.jpg',
              title: 'Matchfoot',
              desc: 'Logo for a footwear & active lifestyle brand',
            },
          ].map(item => (
            <div key={item.id} className="group/digital">
              <Link href={item.externalUrl || '/digital'} target={item.externalUrl ? '_blank' : undefined} rel={item.externalUrl ? 'noopener noreferrer' : undefined}>
                <div className="bg-white h-40 sm:h-48 flex items-center justify-center overflow-hidden">
                  <img
                    src={item.src}
                    alt={item.title}
                    className="w-full h-full object-contain p-2 group-hover/digital:scale-[1.03] transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="pt-2.5">
                  <p className="font-serif text-sm text-ink leading-snug">{item.title}</p>
                  <p className="text-mist text-[11px] mt-0.5 leading-snug">{item.desc}</p>
                  {item.externalUrl && (
                    <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] text-copper uppercase tracking-widest">
                      View site
                      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </span>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── COMMISSION CTA ── */}
      {siteConfig.commissionOpen && (
        <section className="px-6 sm:px-10 py-14 sm:py-20 text-center border-b border-edge">
          <p className="text-[10px] text-copper uppercase tracking-[0.2em] mb-3">Custom Work</p>
          <h2 className="font-serif text-3xl sm:text-4xl text-ink mb-4">{siteConfig.commissionHeadline}</h2>
          <p className="text-mist text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed">{siteConfig.commissionBody}</p>
          <Link
            href="/commissions"
            className="inline-block bg-copper text-darkroom px-8 py-3.5 text-sm tracking-wider uppercase hover:bg-amber-600 transition-colors"
          >
            {siteConfig.commissionCta}
          </Link>
        </section>
      )}

      {modalState && (
        <PhotoModal
          photos={modalState.photos}
          initialIndex={modalState.index}
          onClose={() => setModalState(null)}
          onAddedToCart={() => { setModalState(null); setCartOpen(true) }}
          printSizes={printSizes}
        />
      )}
      {workModalState && (
        <WorkModal
          works={workModalState.works}
          initialIndex={workModalState.index}
          category={workModalState.category}
          categoryLabel={workModalState.categoryLabel}
          onClose={() => setWorkModalState(null)}
        />
      )}
      {oilModalIndex !== null && (
        <OilModal
          works={allOils}
          initialIndex={oilModalIndex}
          onClose={() => setOilModalIndex(null)}
        />
      )}
      {cartOpen && <CartPopup onClose={() => setCartOpen(false)} />}
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const { prisma } = await import('../lib/prisma')
  const { readSiteConfig } = await import('../lib/siteConfig')

  const [siteConfig, allPhotosRaw, allFineArt, stickers, printSizesRaw] = await Promise.all([
    readSiteConfig(),
    prisma.photo.findMany({ orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }] }),
    prisma.fineArtWork.findMany({ where: { type: { in: ['watercolor', 'encaustic', 'oil'] } }, include: { pleinAirImages: { orderBy: { sortOrder: 'asc' } } }, orderBy: { sortOrder: 'asc' } }),
    prisma.sticker.findMany({ orderBy: { sortOrder: 'asc' }, take: 6 }),
    prisma.printSize.findMany({ orderBy: { sortOrder: 'asc' } }),
  ])

  const allPhotosFlat: Photo[] = allPhotosRaw.map(p => ({ id: p.id, filename: p.filename, title: p.title, description: p.description, category: p.category }))

  const heroPhoto = allPhotosFlat.find(p => p.id === siteConfig.homepage.heroPhotoId) || allPhotosFlat[0]

  const picked: Photo[] = []
  for (const id of siteConfig.featuredPhotos) {
    const found = allPhotosFlat.find(p => p.id === id)
    if (found) picked.push(found)
  }
  if (picked.length < 6) {
    const rest = allPhotosFlat.filter(p => !picked.find(x => x.id === p.id))
    picked.push(...rest.slice(0, 6 - picked.length))
  }

  const folderMap = { watercolor: 'watercolors', encaustic: 'encaustics', oil: 'oils' } as const
  const featuredFineArt = siteConfig.featuredFineArt.map(({ id, type }) => {
    const work = allFineArt.find(w => w.id === id && w.type === type)
    if (!work) return null
    return { id: work.id, type, imgPath: `/fine-art/${folderMap[type]}/${work.filename}`, title: work.title }
  }).filter(Boolean) as FeaturedArt[]

  const allPhotos: Record<string, Photo[]> = {}
  for (const p of allPhotosFlat) {
    if (!allPhotos[p.category]) allPhotos[p.category] = []
    allPhotos[p.category].push(p)
  }

  const allOils = allFineArt.filter(w => w.type === 'oil').map(w => ({
    id: w.id, filename: w.filename, title: w.title, description: w.description,
    originalSize: w.originalSize, available: w.available,
    originalPrice: w.originalPrice, reprintAvailable: w.reprintAvailable, reprintPrice: w.reprintPrice,
    award: w.awardTitle ? { title: w.awardTitle, url: w.awardUrl || '' } : null,
    pleinAirImages: w.pleinAirImages.map(p => ({ id: p.id, filename: p.filename, title: p.title })),
  }))

  const allWatercolors = allFineArt.filter(w => w.type === 'watercolor').map(w => ({
    id: w.id, filename: w.filename, title: w.title, description: w.description,
    originalSize: w.originalSize, available: w.available, price: w.price,
  }))

  const allEncaustics = allFineArt.filter(w => w.type === 'encaustic').map(w => ({
    id: w.id, filename: w.filename, title: w.title, description: w.description,
    originalSize: w.originalSize, available: w.available, price: w.price,
  }))

  return {
    props: {
      heroPhoto,
      previewPhotos: picked.slice(0, 6),
      allPhotos,
      allOils,
      allWatercolors,
      allEncaustics,
      featuredFineArt,
      previewStickers: stickers.map(s => s.filename),
      siteConfig: siteConfig.homepage,
      printSizes: printSizesRaw.map(s => ({ label: s.label, price: s.price })),
    },
  }
}
