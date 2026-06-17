import fs from 'fs'
import path from 'path'
import Link from 'next/link'
import { GetServerSideProps } from 'next'
import Layout from '../components/Layout'

interface Photo { id: string; filename: string; title: string; category: string }

interface Props {
  heroPhoto: Photo
  previewPhotos: Photo[]
}

export default function Home({ heroPhoto, previewPhotos }: Props) {
  return (
    <Layout>

      {/* ── HERO ── full-bleed photo */}
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

        {/* Label row — plain div, full width, no link wrapper so text never squishes */}
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
            <span className="hidden sm:inline">Browse prints</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Photo strip — each image links to its own category gallery */}
        <div className="flex overflow-x-auto sm:overflow-hidden sm:grid sm:grid-cols-6 gap-0.5 bg-darkroom">
          {previewPhotos.map(photo => (
            <Link
              key={photo.id}
              href={`/photos/${photo.category}`}
              className="group/photo flex-shrink-0 w-44 sm:w-auto h-48 sm:h-56 overflow-hidden photo-wrapper block relative"
            >
              <img
                src={`/photos/${photo.category}/${photo.filename}`}
                alt={photo.title}
                className="w-full h-full object-cover group-hover/photo:scale-105 transition-transform duration-500 photo-protected"
              />
              {/* Subtle hover tint */}
              <div className="absolute inset-0 bg-black/0 group-hover/photo:bg-black/30 transition-colors duration-300" />
            </Link>
          ))}
        </div>

        {/* Mobile bottom row */}
        <div className="sm:hidden px-6 py-3 flex items-center justify-between">
          <p className="text-mist text-xs">Nature · San Francisco Bay</p>
          <Link href="/shop" className="text-copper text-xs">Browse all →</Link>
        </div>
      </section>

      {/* ── FINE ART + STICKERS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2">

        {/* Fine Art */}
        <Link href="/fine-art" className="group border-b sm:border-b-0 sm:border-r border-edge block">
          <div className="relative h-48 sm:h-60 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #C8956A 0%, #B8743E 50%, #7A4A20 100%)' }}>
            <div className="absolute inset-0 opacity-[0.07]"
              style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)', backgroundSize: '10px 10px' }} />
            <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-8 pb-6">
              <p className="text-[10px] text-white/50 uppercase tracking-[0.2em] mb-1.5">Coming soon</p>
              <h2 className="font-serif text-3xl sm:text-4xl text-white leading-tight">Fine Art</h2>
              <p className="text-white/60 text-sm mt-1">Oil &amp; encaustic paintings</p>
            </div>
          </div>
          <div className="px-6 sm:px-8 py-4 flex items-center justify-between">
            <p className="text-mist text-sm">Original works and limited prints</p>
            <svg className="w-4 h-4 text-mist group-hover:text-copper transition-colors flex-shrink-0 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* AI Stickers */}
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

  // Pick 6 visually diverse shots for the strip
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

  return { props: { heroPhoto, previewPhotos: picked.slice(0, 6) } }
}
