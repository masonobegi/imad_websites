import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { GetServerSideProps } from 'next'
import Layout from '../components/Layout'

interface DigitalWork {
  id: string
  filename: string
  src?: string
  title: string
  subtitle: string | null
  description: string
  externalUrl?: string
  externalLabel?: string
}

interface Props {
  intro: string
  works: DigitalWork[]
}

export default function Digital({ intro, works }: Props) {
  const [popupIdx, setPopupIdx] = useState<number | null>(null)
  const popupWork = popupIdx !== null ? works[popupIdx] : null

  return (
    <Layout>
      <Head>
        <title>Digital Design & Illustration | OBGillustrator.com</title>
        <meta name="description" content="Digital design and illustration work by Imad Obegi — logos, posters, and brand illustrations." />
      </Head>

      {/* Header */}
      <div className="max-w-3xl mx-auto px-5 pt-16 sm:pt-20 pb-10 text-center">
        <p className="text-xs text-copper uppercase tracking-widest mb-4">Portfolio</p>
        <h1 className="font-serif text-4xl sm:text-5xl text-ink mb-4 leading-tight">
          Digital Design &amp; Illustration
        </h1>
        <p className="text-mist leading-relaxed max-w-xl mx-auto mb-8">{intro}</p>

        {/* Commission CTA */}
        <div className="border-t border-edge pt-8">
          <p className="text-xs text-copper uppercase tracking-widest mb-3">Interested in a logo or design?</p>
          <p className="text-mist text-sm max-w-md mx-auto mb-6 leading-relaxed">
            Send your design request to set up a meeting to discuss what you would like to see created for you or your business.
          </p>
          <Link
            href="/commissions"
            className="inline-block bg-copper text-darkroom px-8 py-3.5 text-sm tracking-wider uppercase hover:bg-amber-600 transition-colors"
          >
            Start a Project
          </Link>
        </div>
      </div>

      {/* Work grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        {works.length === 0 ? (
          <p className="text-center text-mist py-16">Portfolio coming soon.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {works.map((d, i) => (
              <div key={d.id} className="group">
                <button
                  onClick={() => setPopupIdx(i)}
                  className="block w-full text-left focus:outline-none"
                  aria-label={`View ${d.title} full size`}
                >
                  <div className="relative bg-white flex items-center justify-center min-h-[300px] sm:min-h-[360px] overflow-hidden border border-edge group-hover:border-shadow transition-colors duration-300">
                    <img
                      src={d.src || `/fine-art/digitals/${d.filename}`}
                      alt={d.title}
                      className="max-w-full max-h-[360px] w-auto object-contain select-none p-4 transition-transform duration-500 group-hover:scale-[1.02]"
                      draggable={false}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 text-white text-xs px-3 py-1.5 uppercase tracking-widest">
                        View full size
                      </span>
                    </div>
                  </div>
                  <div className="pt-3">
                    {d.subtitle && <p className="text-[10px] text-copper uppercase tracking-widest mb-1">{d.subtitle}</p>}
                    <p className="font-serif text-lg text-ink">{d.title}</p>
                    {d.description && <p className="text-mist text-sm mt-1 leading-relaxed">{d.description}</p>}
                  </div>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full-size popup */}
      {popupWork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/92" onClick={() => setPopupIdx(null)} />
          <div className="relative z-10 max-w-3xl w-full mx-4">
            <button
              onClick={() => setPopupIdx(null)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors flex items-center gap-2 text-sm"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Close
            </button>
            {works.length > 1 && (
              <>
                {popupIdx! > 0 && (
                  <button onClick={() => setPopupIdx(i => i! - 1)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 text-white/60 hover:text-white transition-colors"
                    aria-label="Previous">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                )}
                {popupIdx! < works.length - 1 && (
                  <button onClick={() => setPopupIdx(i => i! + 1)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 text-white/60 hover:text-white transition-colors"
                    aria-label="Next">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>
                  </button>
                )}
              </>
            )}
            <img
              src={popupWork.src || `/fine-art/digitals/${popupWork.filename}`}
              alt={popupWork.title}
              className="w-full block select-none"
              draggable={false}
            />
            <div className="text-center mt-3 space-y-2">
              <p className="text-white/60 text-xs">
                {popupWork.subtitle && <span>{popupWork.subtitle} — </span>}
                {popupWork.title}
              </p>
              {popupWork.externalUrl && (
                <a
                  href={popupWork.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-copper text-darkroom text-xs px-5 py-2 uppercase tracking-widest hover:bg-amber-600 transition-colors"
                >
                  {popupWork.externalLabel || 'View More'}
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

const STATIC_DESIGNS = [
  {
    id: 'static-jazz',
    filename: 'rhythms-of-leimert-park.jpg',
    src: '/fine-art/oils/rhythms-of-leimert-park.jpg',
    title: 'Jazz Festival',
    subtitle: 'Winning Poster Design',
    description: '5th Annual Leimert Park Jazz Festival — Juried poster competition for the Leimert Park Jazz Festival.',
    externalUrl: 'https://www.leimertparkbeat.com/',
    externalLabel: 'View Winning Poster Coverage',
  },
  {
    id: 'static-notaries',
    filename: 'notaries-of-the-realm.jpg',
    src: '/digital/notaries-of-the-realm.jpg',
    title: 'Notaries of the Realm',
    subtitle: 'Logo Design',
    description: 'Client requested a distinctive, authoritative logo for a notary services firm. Designed to convey trust, professionalism, and a touch of classic elegance.',
  },
  {
    id: 'static-gumbo',
    filename: 'green-apples-gumbo.jpg',
    src: '/digital/green-apples-gumbo.jpg',
    title: 'Green Apples Gumbo',
    subtitle: 'Logo Design',
    description: 'Client requested a fun, vibrant logo for a catering and food business blending Southern and California flavors. Final design captures the energy and warmth of the brand.',
  },
  {
    id: 'static-matchfoot',
    filename: 'matchfoot.jpg',
    src: '/digital/matchfoot.jpg',
    title: 'Matchfoot',
    subtitle: 'Logo Design',
    description: 'Client requested a modern, sporty logo for a footwear and active lifestyle brand. Clean, bold design built for versatility across digital and print.',
  },
]

export const getServerSideProps: GetServerSideProps = async () => {
  const { prisma } = await import('../lib/prisma')
  const { readSiteConfig } = await import('../lib/siteConfig')
  const [siteConfig, works] = await Promise.all([
    readSiteConfig(),
    prisma.fineArtWork.findMany({ where: { type: 'digital' }, orderBy: { sortOrder: 'asc' } }),
  ])
  const mappedWorks = works.map(w => ({
    id: w.id, filename: w.filename, title: w.title,
    subtitle: w.originalSize, description: w.description,
  }))
  return {
    props: {
      intro: siteConfig.digitalDesign.intro,
      works: mappedWorks.length > 0 ? mappedWorks : STATIC_DESIGNS,
    },
  }
}
