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
      {/* HERO — full-bleed photo with name over it */}
      <section className="relative h-[70vh] sm:h-[80vh] overflow-hidden photo-wrapper">
        <img
          src={`/photos/${heroPhoto.category}/${heroPhoto.filename}`}
          alt="Imad Photography"
          className="absolute inset-0 w-full h-full object-cover photo-protected"
        />
        {/* Dark gradient so text is readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />

        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-12 pb-10 sm:pb-14">
          <h1 className="font-serif text-5xl sm:text-7xl text-white mb-2 leading-none">Imad</h1>
          <p className="text-white/70 text-sm sm:text-base tracking-wide">
            Artist · Photographer · OBGillustrator.com
          </p>
        </div>
      </section>

      {/* PHOTOGRAPHY — real photo strip */}
      <section className="border-b border-edge">
        <Link href="/shop" className="group block">
          <div className="flex flex-col sm:flex-row">

            {/* Label column */}
            <div className="sm:w-64 flex-shrink-0 px-6 sm:px-10 py-7 sm:py-10 flex flex-col justify-between border-b sm:border-b-0 sm:border-r border-edge">
              <div>
                <p className="text-xs text-copper uppercase tracking-widest mb-3">Available now</p>
                <h2 className="font-serif text-3xl sm:text-4xl text-ink mb-3 leading-tight">Photography</h2>
                <p className="text-mist text-sm leading-relaxed">
                  Nature, wildlife, and the San Francisco Bay. Metal and canvas prints, made to order.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-copper text-sm group-hover:gap-3 transition-all">
                <span>Browse prints</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Photo strip */}
            <div className="flex-1 flex overflow-x-auto sm:overflow-hidden gap-1 p-1 sm:p-0 bg-darkroom/5">
              {previewPhotos.map(photo => (
                <div key={photo.id} className="flex-shrink-0 w-44 sm:flex-1 h-52 sm:h-64 overflow-hidden photo-wrapper">
                  <img
                    src={`/photos/${photo.category}/${photo.filename}`}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 photo-protected"
                  />
                </div>
              ))}
            </div>
          </div>
        </Link>
      </section>

      {/* FINE ART + STICKERS — side by side placeholders */}
      <div className="grid grid-cols-1 sm:grid-cols-2">

        {/* Fine Art */}
        <Link href="/fine-art" className="group relative overflow-hidden border-b sm:border-b-0 sm:border-r border-edge">
          {/* Warm textured background */}
          <div className="h-52 sm:h-64 bg-gradient-to-br from-[#C8956A] via-[#B8743E] to-[#8B5430] flex items-end p-6 sm:p-8">
            {/* Faint pattern overlay for texture */}
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)', backgroundSize: '8px 8px' }}
            />
            <div className="relative z-10">
              <p className="text-xs text-white/60 uppercase tracking-widest mb-2">Coming soon</p>
              <h2 className="font-serif text-3xl sm:text-4xl text-white mb-1 leading-tight">Fine Art</h2>
              <p className="text-white/70 text-sm">Oil &amp; encaustic paintings</p>
            </div>
          </div>
          <div className="px-6 sm:px-8 py-5 flex items-center justify-between bg-canvas">
            <p className="text-mist text-sm">Original works and limited prints</p>
            <svg className="w-4 h-4 text-mist group-hover:text-copper transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* AI Stickers */}
        <Link href="/stickers" className="group relative overflow-hidden">
          {/* Warmer, lighter background */}
          <div className="h-52 sm:h-64 bg-gradient-to-br from-[#E8C97A] via-[#D4A843] to-[#A07830] flex items-end p-6 sm:p-8">
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'repeating-linear-gradient(-45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)', backgroundSize: '8px 8px' }}
            />
            <div className="relative z-10">
              <p className="text-xs text-white/60 uppercase tracking-widest mb-2">Coming soon</p>
              <h2 className="font-serif text-3xl sm:text-4xl text-white mb-1 leading-tight">AI Stickers</h2>
              <p className="text-white/70 text-sm">Original character designs</p>
            </div>
          </div>
          <div className="px-6 sm:px-8 py-5 flex items-center justify-between bg-canvas">
            <p className="text-mist text-sm">Packs and singles</p>
            <svg className="w-4 h-4 text-mist group-hover:text-copper transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

  // Hero: use a dramatic nature shot (Milky Way)
  const heroPhoto = nature.find((p: Photo) => p.filename.includes('milky-way-over-joshua-tree'))
    || nature[0]

  // Preview strip: mix of both categories, pick visually diverse shots
  const wantedNature = ['delicate-arch-at-dawn', 'dahlia-symphony', 'the-lone-cypress', 'gondolas-of-venice']
  const wantedSF = ['golden-gate-in-the-mist', 'bay-of-gold']

  const picked: Photo[] = []
  for (const id of wantedNature) {
    const found = nature.find((p: Photo) => p.id === id)
    if (found) picked.push(found)
  }
  for (const id of wantedSF) {
    const found = sf.find((p: Photo) => p.id === id)
    if (found) picked.push(found)
  }
  // Fill up to 6 if we didn't find all the wanted ones
  if (picked.length < 4) {
    const all = [...nature, ...sf].filter((p: Photo) => !picked.find(x => x.id === p.id))
    picked.push(...all.slice(0, 6 - picked.length))
  }

  return {
    props: { heroPhoto, previewPhotos: picked.slice(0, 6) },
  }
}
