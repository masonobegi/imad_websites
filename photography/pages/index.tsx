import fs from 'fs'
import path from 'path'
import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { GetServerSideProps } from 'next'
import Layout from '../components/Layout'
import PhotoModal from '../components/PhotoModal'
import CartPopup from '../components/CartPopup'
import { Photo } from '../lib/photos'

interface FineArtWork {
  id: string
  filename: string
  title: string
}

interface Props {
  heroPhoto: Photo
  previewPhotos: Photo[]
  allPhotos: Record<string, Photo[]>
  previewWatercolors: FineArtWork[]
}

export default function Home({ heroPhoto, previewPhotos, allPhotos, previewWatercolors }: Props) {
  const [modalState, setModalState] = useState<{ photos: Photo[]; index: number } | null>(null)
  const [cartOpen, setCartOpen] = useState(false)

  const openPhoto = (photo: Photo) => {
    const arr: Photo[] = allPhotos[photo.category] || []
    const idx = arr.findIndex(p => p.id === photo.id)
    setModalState({ photos: arr, index: idx >= 0 ? idx : 0 })
  }

  return (
    <Layout>
      <Head>
        <title>Imad | Fine Art Photography Prints | OBGillustrator.com</title>
        <meta name="description" content="Photography prints by Imad Obegi — nature, wildlife, and the San Francisco Bay. Printed on archival metal or canvas. Made to order, ships flat." />
        <meta property="og:title" content="Imad | Fine Art Photography Prints" />
        <meta property="og:description" content="Nature, wildlife, and the San Francisco Bay — fine art prints on metal or canvas by Imad Obegi." />
        <meta property="og:image" content="/photos/nature/milky-way-over-joshua-tree.jpg" />
      </Head>

      {/* ── HERO ── */}
      <section className="relative h-[65vh] sm:h-[78vh] overflow-hidden photo-wrapper">
        <img
          src={`/photos/${heroPhoto.category}/${heroPhoto.filename}`}
          alt="Imad Photography"
          className="absolute inset-0 w-full h-full object-cover photo-protected"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-12 pb-8 sm:pb-14">
          <h1 className="font-serif text-5xl sm:text-7xl text-white leading-none mb-2">Imad</h1>
          <p className="text-white/65 text-sm sm:text-base tracking-wide">
            Artist · Photographer · OBGillustrator.com
          </p>
        </div>
      </section>

      {/* ── PHOTOGRAPHY ── */}
      <section className="border-b border-edge">

        {/* Label row */}
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

        {/* Photo strip — click opens purchase modal */}
        <div className="flex overflow-x-auto sm:overflow-hidden sm:grid sm:grid-cols-6 gap-0.5 bg-darkroom">
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
              />
              <div className="absolute inset-0 bg-black/0 group-hover/photo:bg-black/35 transition-colors duration-300 flex items-end">
                <p className="opacity-0 group-hover/photo:opacity-100 transition-opacity duration-300 text-white text-xs px-3 pb-3 leading-snug">
                  {photo.title}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Mobile bottom row */}
        <div className="sm:hidden px-6 py-3 flex items-center justify-between">
          <p className="text-mist text-xs">Tap a photo to order a print</p>
          <Link href="/shop" className="text-copper text-xs">Browse all →</Link>
        </div>
      </section>

      {/* ── WATERCOLORS ── */}
      <section className="border-b border-edge">
        <div className="px-6 sm:px-10 py-6 flex items-center justify-between border-b border-edge">
          <div>
            <p className="text-[10px] text-copper uppercase tracking-[0.2em] mb-1.5">Fine Art</p>
            <h2 className="font-serif text-3xl sm:text-4xl text-ink">Watercolors</h2>
            <p className="text-mist text-sm mt-1 hidden sm:block">
              Original paintings · Inquire for pricing
            </p>
          </div>
          <Link
            href="/fine-art/watercolors"
            className="flex items-center gap-2 text-copper text-sm flex-shrink-0 ml-6 hover:gap-3 transition-all duration-200"
          >
            <span className="hidden sm:inline">Browse all</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="flex overflow-x-auto sm:overflow-hidden sm:grid sm:grid-cols-6 gap-0.5 bg-edge">
          {previewWatercolors.map(work => (
            <Link
              key={work.id}
              href="/fine-art/watercolors"
              className="group/wc flex-shrink-0 w-44 sm:w-auto h-48 sm:h-56 overflow-hidden block relative"
            >
              <img
                src={`/fine-art/watercolors/${work.filename}`}
                alt={work.title}
                className="w-full h-full object-cover group-hover/wc:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/0 group-hover/wc:bg-black/35 transition-colors duration-300 flex items-end">
                <p className="opacity-0 group-hover/wc:opacity-100 transition-opacity duration-300 text-white text-xs px-3 pb-3 leading-snug">
                  {work.title}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="sm:hidden px-6 py-3 flex items-center justify-between">
          <p className="text-mist text-xs">Original watercolor paintings</p>
          <Link href="/fine-art/watercolors" className="text-copper text-xs">Browse all →</Link>
        </div>
      </section>

      {/* ── FINE ART + STICKERS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2">

        <Link href="/fine-art" className="group border-b sm:border-b-0 sm:border-r border-edge block">
          <div className="relative h-48 sm:h-60 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #C8956A 0%, #B8743E 50%, #7A4A20 100%)' }}>
            <div className="absolute inset-0 opacity-[0.07]"
              style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)', backgroundSize: '10px 10px' }} />
            <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-8 pb-6">
              <p className="text-[10px] text-white/50 uppercase tracking-[0.2em] mb-1.5">Available now</p>
              <h2 className="font-serif text-3xl sm:text-4xl text-white leading-tight">Fine Art</h2>
              <p className="text-white/60 text-sm mt-1">Watercolors, oil &amp; encaustic</p>
            </div>
          </div>
          <div className="px-6 sm:px-8 py-4 flex items-center justify-between">
            <p className="text-mist text-sm">Original works and limited prints</p>
            <svg className="w-4 h-4 text-mist group-hover:text-copper transition-colors flex-shrink-0 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        <Link href="/stickers" className="group block">
          <div className="relative h-48 sm:h-60 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #E8C97A 0%, #D4A843 50%, #9A7420 100%)' }}>
            <div className="absolute inset-0 opacity-[0.07]"
              style={{ backgroundImage: 'repeating-linear-gradient(-45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)', backgroundSize: '10px 10px' }} />
            <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-8 pb-6">
              <p className="text-[10px] text-white/50 uppercase tracking-[0.2em] mb-1.5">Coming soon</p>
              <h2 className="font-serif text-3xl sm:text-4xl text-white leading-tight">AI Stickers</h2>
              <p className="text-white/60 text-sm mt-1">Original character designs</p>
            </div>
          </div>
          <div className="px-6 sm:px-8 py-4 flex items-center justify-between">
            <p className="text-mist text-sm">Packs and singles</p>
            <svg className="w-4 h-4 text-mist group-hover:text-copper transition-colors flex-shrink-0 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

      </div>

      {/* Modal */}
      {modalState && (
        <PhotoModal
          photos={modalState.photos}
          initialIndex={modalState.index}
          onClose={() => setModalState(null)}
          onAddedToCart={() => { setModalState(null); setCartOpen(true) }}
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
  const allWatercolors: FineArtWork[] = fineArtData.works.watercolors || []
  // Pick a varied spread — paintings that show different subjects
  const wantedWatercolors = [
    'the-crab-shack-salter-path',
    'atlantic-crossing',
    'crimson-canna',
    'morning-light-on-majolica',
    'the-spirit-of-santa-monica',
    'sentinel-of-the-high-desert',
  ]
  const pickedWatercolors: FineArtWork[] = []
  for (const id of wantedWatercolors) {
    const found = allWatercolors.find(w => w.id === id)
    if (found) pickedWatercolors.push(found)
  }
  if (pickedWatercolors.length < 6) {
    const rest = allWatercolors.filter(w => !pickedWatercolors.find(x => x.id === w.id))
    pickedWatercolors.push(...rest.slice(0, 6 - pickedWatercolors.length))
  }

  return {
    props: {
      heroPhoto,
      previewPhotos: picked.slice(0, 6),
      allPhotos: { nature, 'san-francisco': sf },
      previewWatercolors: pickedWatercolors.slice(0, 6),
    },
  }
}
