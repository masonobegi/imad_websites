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

interface Props {
  heroPhoto: Photo
  previewPhotos: Photo[]
  allPhotos: Record<string, Photo[]>
  allOils: OilWork[]
  allWatercolors: Work[]
  allEncaustics: Work[]
}

const FEATURED_FINE_ART = [
  { id: 'the-crab-shack-salter-path', type: 'watercolor' as const, imgPath: '/fine-art/watercolors/the-crab-shack-salter-path.jpg', title: 'The Crab Shack, Salter Path' },
  { id: 'autumn-arrival-engine-no-3', type: 'watercolor' as const, imgPath: '/fine-art/watercolors/autumn-arrival-engine-no-3.jpg', title: 'Autumn Arrival' },
  { id: 'fields-of-mustard', type: 'encaustic' as const, imgPath: '/fine-art/encaustics/fields-of-mustard.jpg', title: 'Fields of Mustard' },
  { id: 'wooden-shoe-tulip-festival', type: 'oil' as const, imgPath: '/fine-art/oils/wooden-shoe-tulip-festival.jpg', title: 'Wooden Shoe Tulip Festival' },
  { id: 'peacock-on-display', type: 'encaustic' as const, imgPath: '/fine-art/encaustics/peacock-on-display.jpg', title: 'Peacock on Display' },
  { id: 'south-falls', type: 'oil' as const, imgPath: '/fine-art/oils/south-falls.jpg', title: 'South Falls, Silverton, Oregon' },
]

export default function Home({ heroPhoto, previewPhotos, allPhotos, allOils, allWatercolors, allEncaustics }: Props) {
  const [modalState, setModalState] = useState<{ photos: Photo[]; index: number } | null>(null)
  const [workModalState, setWorkModalState] = useState<{ works: Work[], index: number, category: string, categoryLabel: string } | null>(null)
  const [oilModalIndex, setOilModalIndex] = useState<number | null>(null)
  const [cartOpen, setCartOpen] = useState(false)

  const openPhoto = (photo: Photo) => {
    const arr: Photo[] = allPhotos[photo.category] || []
    const idx = arr.findIndex(p => p.id === photo.id)
    setModalState({ photos: arr, index: idx >= 0 ? idx : 0 })
  }

  const openFeaturedWork = (item: typeof FEATURED_FINE_ART[0]) => {
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
          <h1 className="font-serif text-5xl sm:text-7xl text-white leading-none mb-2">Imad Obegi</h1>
          <p className="text-white/65 text-sm sm:text-base tracking-wide">
            Artist · Photographer · OBGillustrator.com
          </p>
        </div>
      </section>

      {/* ── PHOTOGRAPHY ── */}
      <section className="border-b border-edge">
        <div className="px-6 sm:px-10 py-6 flex items-center justify-between border-b border-edge">
          <div>
            <p className="text-[10px] text-copper uppercase tracking-[0.2em] mb-1.5">Available now</p>
            <h2 className="font-serif text-3xl sm:text-4xl text-ink">Photography</h2>
            <p className="text-mist text-sm mt-1 hidden sm:block">
              Nature, wildlife, and the San Francisco Bay · Metal &amp; canvas prints
            </p>
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
          <h2 className="font-serif text-3xl sm:text-4xl text-ink">Fine Art</h2>
          <p className="text-mist text-sm mt-1 hidden sm:block">
            Watercolors, oil paintings &amp; encaustics · Originals &amp; prints
          </p>
        </div>

        <div className="flex overflow-x-auto sm:overflow-hidden sm:grid sm:grid-cols-6 gap-2 bg-edge">
          {FEATURED_FINE_ART.map(item => (
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
      <section className="px-6 sm:px-10 py-14 sm:py-20 text-center border-b border-edge">
        <p className="text-[10px] text-copper uppercase tracking-[0.2em] mb-3">Custom Work</p>
        <h2 className="font-serif text-3xl sm:text-4xl text-ink mb-4">Have something in mind?</h2>
        <p className="text-mist text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed">
          Imad Obegi takes commissions — watercolors, encaustics, prints, and custom designs.
          Tell him what you&apos;re envisioning and he&apos;ll be in touch.
        </p>
        <Link
          href="/commissions"
          className="inline-block bg-copper text-darkroom px-8 py-3.5 text-sm tracking-wider uppercase hover:bg-amber-600 transition-colors"
        >
          Commission a Piece
        </Link>
      </section>

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
  const dataPath = path.join(process.cwd(), 'public', 'photos', 'data.json')
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))

  const nature: Photo[] = data.photos.nature || []
  const sf: Photo[] = data.photos['san-francisco'] || []

  const heroPhoto =
    nature.find((p: Photo) => p.filename.includes('milky-way-over-joshua-tree')) || nature[0]

  const wantedNature = ['delicate-arch-at-dawn', 'dahlia-symphony', 'the-lone-cypress', 'milky-way-over-hidden-valley']
  const wantedSF    = ['golden-gate-in-the-mist', 'bay-of-gold']

  const picked: Photo[] = []
  for (const id of wantedNature) {
    const found = nature.find((p: Photo) => p.id === id)
    if (found) picked.push(found)
  }
  for (const id of wantedSF) {
    const found = sf.find((p: Photo) => p.id === id)
    if (found) picked.push(found)
  }
  if (picked.length < 6) {
    const rest = [...nature, ...sf].filter((p: Photo) => !picked.find(x => x.id === p.id))
    picked.push(...rest.slice(0, 6 - picked.length))
  }

  const fineArtDataPath = path.join(process.cwd(), 'public', 'fine-art', 'data.json')
  const fineArtData = JSON.parse(fs.readFileSync(fineArtDataPath, 'utf-8'))

  return {
    props: {
      heroPhoto,
      previewPhotos: picked.slice(0, 6),
      allPhotos: { nature, 'san-francisco': sf },
      allOils: fineArtData.works.oils || [],
      allWatercolors: fineArtData.works.watercolors || [],
      allEncaustics: fineArtData.works.encaustics || [],
    },
  }
}
