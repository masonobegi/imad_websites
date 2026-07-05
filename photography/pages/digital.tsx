import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { GetServerSideProps } from 'next'
import Layout from '../components/Layout'

const DESIGNS = [
  {
    file: 'jazz-festival.jpg',
    title: '5th Annual Leimert Park Jazz Festival',
    subtitle: 'Winning Poster Design',
    description: 'Juried poster competition for the Leimert Park Jazz Festival.',
    popup: true,
  },
  {
    file: 'notaries-of-the-realm.jpg',
    title: 'Notaries of the Realm',
    subtitle: 'Logo Design',
    description: 'A dragon\'s head blending seamlessly into a fountain pen nib — created for a notary company catering to renaissance fairs.',
    popup: false,
  },
  {
    file: 'green-apples-gumbo.jpg',
    title: 'Green Apples Gumbo',
    subtitle: 'Product Label Design',
    description: 'Food product label for a Gumbo Base with an old Louisiana feel — inviting and appetizing.',
    popup: false,
  },
  {
    file: 'matchfoot.jpg',
    title: 'Matchfoot.com',
    subtitle: 'Logo Design',
    description: 'A dynamic illustration representing "lighting a fire under one\'s foot" — energy, motion, and motivation.',
    popup: false,
  },
]

interface Props {
  intro: string
}

export default function Digital({ intro }: Props) {
  const [popupOpen, setPopupOpen] = useState(false)

  return (
    <Layout>
      <Head>
        <title>Digital Design & Illustration | OBGillustrator.com</title>
        <meta name="description" content="Digital design and illustration work by Imad Obegi — logos, posters, and brand illustrations." />
      </Head>

      {/* Header + Commission CTA */}
      <div className="max-w-3xl mx-auto px-5 pt-16 sm:pt-20 pb-10 text-center">
        <p className="text-xs text-copper uppercase tracking-widest mb-4">Portfolio</p>
        <h1 className="font-serif text-4xl sm:text-5xl text-ink mb-4 leading-tight">
          Digital Design &amp; Illustration
        </h1>
        <p className="text-mist leading-relaxed max-w-xl mx-auto mb-8">
          {intro}
        </p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {DESIGNS.map(d => (
            <div key={d.file} className="group">
              {d.popup ? (
                <button
                  onClick={() => setPopupOpen(true)}
                  className="block w-full text-left focus:outline-none"
                  aria-label={`View ${d.title} full size`}
                >
                  <div className="relative bg-white flex items-center justify-center min-h-[300px] sm:min-h-[360px] overflow-hidden border border-edge group-hover:border-shadow transition-colors duration-300">
                    <img
                      src={`/digital/${d.file}`}
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
                    <p className="text-[10px] text-copper uppercase tracking-widest mb-1">{d.subtitle}</p>
                    <p className="font-serif text-lg text-ink">{d.title}</p>
                    <p className="text-mist text-sm mt-1 leading-relaxed">{d.description}</p>
                  </div>
                </button>
              ) : (
                <div>
                  <div className="relative bg-white flex items-center justify-center min-h-[300px] sm:min-h-[360px] overflow-hidden border border-edge group-hover:border-shadow transition-colors duration-300">
                    <img
                      src={`/digital/${d.file}`}
                      alt={d.title}
                      className="max-w-full max-h-[360px] w-auto object-contain select-none p-4 transition-transform duration-500 group-hover:scale-[1.02]"
                      draggable={false}
                    />
                  </div>
                  <div className="pt-3">
                    <p className="text-[10px] text-copper uppercase tracking-widest mb-1">{d.subtitle}</p>
                    <p className="font-serif text-lg text-ink">{d.title}</p>
                    <p className="text-mist text-sm mt-1 leading-relaxed">{d.description}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>

      {/* Jazz Festival full-size popup */}
      {popupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/92" onClick={() => setPopupOpen(false)} />
          <div className="relative z-10 max-w-3xl w-full mx-4">
            <button
              onClick={() => setPopupOpen(false)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors flex items-center gap-2 text-sm"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Close
            </button>
            <img
              src="/digital/jazz-festival.jpg"
              alt="5th Annual Leimert Park Jazz Festival winning poster by Imad Obegi"
              className="w-full block select-none"
              draggable={false}
            />
            <p className="text-white/60 text-xs text-center mt-3">5th Annual Leimert Park Jazz Festival — Winning poster by Imad Obegi</p>
          </div>
        </div>
      )}
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const { readSiteConfig } = await import('../lib/siteConfig')
  const siteConfig = await readSiteConfig()
  return { props: { intro: siteConfig.digitalDesign.intro } }
}
