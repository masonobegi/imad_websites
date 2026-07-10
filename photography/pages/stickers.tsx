import Head from 'next/head'
import { GetServerSideProps } from 'next'
import Layout from '../components/Layout'

const STICKER_MULE_URL = 'https://www.stickermule.com/obgillustrator'

interface Props {
  stickers: string[]
  heading: string
  intro: string
}

export default function Stickers({ stickers, heading, intro }: Props) {
  return (
    <Layout>
      <Head>
        <title>Stickers | OBGillustrator.com</title>
        <meta name="description" content="Original character sticker designs by Imad Obegi — Sasquatch in every situation. Available on Sticker Mule." />
      </Head>

      {/* Header */}
      <div className="max-w-3xl mx-auto px-5 pt-16 sm:pt-20 pb-10 text-center">
        <p className="text-xs text-copper uppercase tracking-widest mb-4">Stickers</p>
        <h1 className="font-serif text-4xl sm:text-5xl text-ink mb-4 leading-tight">
          {heading}
        </h1>
        <p className="text-mist leading-relaxed mb-8 text-left">
          {intro}
        </p>
        <a
          href={STICKER_MULE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-copper text-darkroom px-8 py-3 text-sm tracking-wider uppercase hover:bg-amber-600 transition-colors"
        >
          Shop on Sticker Mule
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      {/* Sticker grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        {stickers.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
            {stickers.map(filename => (
              <a
                key={filename}
                href={STICKER_MULE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-2 touch-manipulation"
                aria-label={`${filename.replace(/\.[^.]+$/, '').replace(/-/g, ' ')} — shop on Sticker Mule`}
              >
                <div className="w-full aspect-square rounded-xl overflow-hidden bg-canvas/50 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center p-2">
                  <img
                    src={`/stickers/${filename}`}
                    alt={filename.replace(/\.[^.]+$/, '').replace(/-/g, ' ')}
                    className="w-full h-full object-contain select-none"
                    draggable={false}
                  />
                </div>
                <p className="text-center text-[10px] text-mist leading-tight group-hover:text-copper transition-colors capitalize">
                  {filename.replace(/\.[^.]+$/, '').replace(/-/g, ' ')}
                </p>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-center text-mist text-sm py-10">No stickers added yet.</p>
        )}

        <p className="mt-8 text-xs text-mist opacity-60 text-center">More designs available on Sticker Mule</p>
      </div>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const { prisma } = await import('../lib/prisma')
  const { readSiteConfig } = await import('../lib/siteConfig')

  const [stickerRows, siteConfig] = await Promise.all([
    prisma.sticker.findMany({ orderBy: { sortOrder: 'asc' } }),
    readSiteConfig(),
  ])

  return {
    props: {
      stickers: stickerRows.map(s => s.filename),
      heading: siteConfig.stickers.heading,
      intro: siteConfig.stickers.intro,
    },
  }
}
