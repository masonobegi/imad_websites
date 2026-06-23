import fs from 'fs'
import path from 'path'
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

interface Props {
  heroPhoto: Photo
  previewPhotos: Photo[]
  allPhotos: Record<string, Photo[]>
  allOils: OilWork[]
  allWatercolors: Work[]
  allEncaustics: Work[]
  featuredFineArt: FeaturedArt[]
  siteConfig: SiteConfig['homepage']
}

export default function Home({ heroPhoto, previewPhotos, allPhotos, allOils, allWatercolors, allEncaustics, featuredFineArt, siteConfig }: Props) {
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

      {/* ── PHOTOGRAPHY ── */}
      <section className="border-b border-edge">
        <div className="px-6 sm:px-10 py-6 flex items-center justify-between border-b border-edge">
          <div>
            <p className="text-[10px] text-copper uppercase tracking-[0.2em] mb-1.5">Available now</p>
            <h2 className="font-serif text-3xl sm:text-4xl text-ink">{siteConfig.photoStripHeadline}</h2>
            <p className="text-mist text-sm mt-1 hidden sm:block">{siteConfig.photoStripSubtext}</p>
          </div>
          <Link
            href="/shop"
            className="flex items-center gap-2 text-copper text-sm flex-shrink-0 ml-6 hover:gap-3 transition-all duration-200"
          >
            <span className="hidden sm:inline">Browse all</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="flex overflow-x-auto sm:overflow-hidden sm:grid sm:grid-cols-6 gap-2 bg-darkroom">
          {previewPhotos.map(photo => (
            <button
              key={photo.id}
              onClick={() => openPhoto(photo)}
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
            </button>
          ))}
        </div>

        <div className="sm:hidden px-6 py-3 flex items-center justify-between">
          <p className="text-mist text-xs">Tap a photo to order a print</p>
          <Link href="/shop" className="text-copper text-xs">Browse all →</Link>
        </div>
      </section>

      {/* ── FINE ART ── */}
      <section className="border-b border-edge">
        <div className="px-6 sm:px-10 py-6 border-b border-edge">
          <p className="text-[10px] text-copper uppercase tracking-[0.2em] mb-1.5">Fine Art</p>
          <h2 className="font-serif text-3xl sm:text-4xl text-ink">{siteConfig.fineArtHeadline}</h2>
          <p className="text-mist text-sm mt-1 hidden sm:block">{siteConfig.fineArtSubtext}</p>
        </div>

        <div className="flex overflow-x-auto sm:overflow-hidden sm:grid sm:grid-cols-6 gap-2 bg-edge">
          {featuredFineArt.map(item => (
            <button
              key={item.id}
              onClick={() => openFeaturedWork(item)}
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
            </button>
          ))}
        </div>

        <Link
          href="/fine-art"
          className="flex items-center justify-center gap-3 py-6 sm:py-8 border-t border-edge text-copper hover:bg-canvas/50 transition-colors group"
        >
          <span className="font-serif text-2xl sm:text-3xl tracking-wide">Browse All Fine Art</span>
          <svg className="w-7 h-7 group-hover:translate-x-1.5 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
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
  const { readSiteConfig } = await import('../lib/siteConfig')
  const siteConfig = readSiteConfig()

  const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public', 'photos', 'data.json'), 'utf-8'))
  const fineArtData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public', 'fine-art', 'data.json'), 'utf-8'))

  // Flatten all photos for lookup
  const allPhotosFlat: Photo[] = Object.entries(
    data.photos as Record<string, Photo[]>
  ).flatMap(([cat, photos]) => photos.map(p => ({ ...p, category: cat })))

  // Hero photo from config
  const heroPhoto =
    allPhotosFlat.find((p: Photo) => p.id === siteConfig.homepage.heroPhotoId) ||
    allPhotosFlat[0]

  // Featured photos strip — pick by ID from config, pad from all photos if needed
  const picked: Photo[] = []
  for (const id of siteConfig.featuredPhotos) {
    const found = allPhotosFlat.find((p: Photo) => p.id === id)
    if (found) picked.push(found)
  }
  if (picked.length < 6) {
    const rest = allPhotosFlat.filter((p: Photo) => !picked.find(x => x.id === p.id))
    picked.push(...rest.slice(0, 6 - picked.length))
  }

  // Featured fine art strip — resolve id+type to full work data
  const folderMap = { watercolor: 'watercolors', encaustic: 'encaustics', oil: 'oils' } as const
  const featuredFineArt = siteConfig.featuredFineArt.map(({ id, type }) => {
    const arr: { id: string; filename: string; title: string }[] = fineArtData.works[folderMap[type]] || []
    const work = arr.find(w => w.id === id)
    if (!work) return null
    return {
      id: work.id,
      type,
      imgPath: `/fine-art/${folderMap[type]}/${work.filename}`,
      title: work.title,
    }
  }).filter(Boolean) as FeaturedArt[]

  // Group all photos by category for modal navigation
  const allPhotos: Record<string, Photo[]> = {}
  for (const [cat, photos] of Object.entries(data.photos as Record<string, Photo[]>)) {
    allPhotos[cat] = photos.map(p => ({ ...p, category: cat }))
  }

  return {
    props: {
      heroPhoto,
      previewPhotos: picked.slice(0, 6),
      allPhotos,
      allOils: fineArtData.works.oils || [],
      allWatercolors: fineArtData.works.watercolors || [],
      allEncaustics: fineArtData.works.encaustics || [],
      featuredFineArt,
      siteConfig: siteConfig.homepage,
    },
  }
}
