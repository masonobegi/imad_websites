import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { GetServerSideProps } from 'next'
import Layout from '../../components/Layout'
import OilModal, { OilWork } from '../../components/OilModal'

interface Props {
  works: OilWork[]
}

export default function OilPaintings({ works }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  return (
    <Layout>
      <Head>
        <title>Oil Paintings | Fine Art | OBGillustrator.com</title>
        <meta name="description" content="Original oil paintings by Imad Obegi — plein air landscapes and studio works. Select originals available; archival reprints at $95." />
        <meta property="og:title" content="Oil Paintings by Imad Obegi" />
        <meta property="og:description" content="Plein air oils and studio paintings. Original oils available from $950; archival watercolor paper reprints $95." />
        {works[0] && <meta property="og:image" content={`https://obgillustrator.com/fine-art/oils/${works[0].filename}`} />}
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-16">
        <div className="mb-8">
          <p className="text-xs text-mist mb-3">
            <Link href="/fine-art" className="hover:text-copper transition-colors">Fine Art</Link>
            <span className="mx-2 opacity-40">›</span>
            Oil Paintings
          </p>
          <h1 className="font-serif text-3xl text-ink mb-1">Oil Paintings</h1>
          <p className="text-mist text-sm max-w-md">
            Plein air and studio Oils. High quality reprints available.
          </p>
        </div>

        <div className="photo-grid">
          {works.map((work, i) => (
            <div key={work.id} className="photo-item">
              <button
                onClick={() => setSelectedIndex(i)}
                className="group block w-full text-left focus:outline-none"
              >
                <div className="relative overflow-hidden bg-edge">
                  <img
                    src={`/fine-art/oils/${work.filename}?v=3`}
                    alt={work.title}
                    className="w-full block transition-transform duration-500 group-hover:scale-[1.03] select-none"
                    draggable={false}
                    loading="lazy"
                  />

                  {/* Award badge */}
                  {work.award && (
                    <div className="absolute top-2 left-2">
                      <span className="flex items-center gap-1 bg-copper text-darkroom text-[10px] px-1.5 py-0.5 uppercase tracking-wider font-medium">
                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        Award Winner
                      </span>
                    </div>
                  )}

                  {/* Available badge */}
                  {work.available && !work.award && (
                    <div className="absolute top-2 left-2">
                      <span className="text-[10px] bg-copper text-darkroom px-1.5 py-0.5 uppercase tracking-wider font-medium">
                        Original Available
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/45 transition-colors duration-300 flex items-end">
                    <div className="p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <p className="text-white text-sm font-medium leading-snug">{work.title}</p>
                      {work.originalSize && (
                        <p className="text-white/60 text-xs mt-0.5">{work.originalSize} original</p>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 border border-edge px-6 py-5 max-w-lg mx-auto text-center">
          <p className="text-xs text-copper uppercase tracking-widest mb-2">Reprints</p>
          <p className="text-mist text-sm leading-relaxed">
            Archival watercolor paper reprints are available for all four paintings at $95 each (11"×14").
            Contact Imad to order.
          </p>
          <a
            href="mailto:imadobegi@gmail.com?subject=Oil Painting Reprint Inquiry"
            className="inline-block mt-3 text-xs text-copper border border-copper px-4 py-2 uppercase tracking-wider hover:bg-copper hover:text-darkroom transition-colors"
          >
            Contact for Reprints
          </a>
        </div>
      </div>

      {selectedIndex !== null && (
        <OilModal
          works={works}
          initialIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
        />
      )}
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const { prisma } = await import('../../lib/prisma')
  const oils = await prisma.fineArtWork.findMany({
    where: { type: 'oil' },
    include: { pleinAirImages: { orderBy: { sortOrder: 'asc' } } },
    orderBy: { sortOrder: 'asc' },
  })
  return {
    props: {
      works: oils.map(w => ({
        id: w.id, filename: w.filename, title: w.title, description: w.description,
        originalSize: w.originalSize, available: w.available,
        originalPrice: w.originalPrice, reprintAvailable: w.reprintAvailable, reprintPrice: w.reprintPrice,
        reprintMedium: w.reprintMedium,
        award: w.awardTitle ? { title: w.awardTitle, url: w.awardUrl || '' } : null,
        pleinAirImages: w.pleinAirImages.map(p => ({ id: p.id, filename: p.filename, title: p.title })),
      })),
    },
  }
}
