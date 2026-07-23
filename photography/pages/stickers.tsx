import Head from 'next/head'
import { GetServerSideProps } from 'next'
import { useState, useEffect } from 'react'
import Layout from '../components/Layout'

const STICKER_MULE_URL = 'https://www.stickermule.com/obgillustrator'

interface Props {
  stickers: string[]
  heading: string
  intro: string
}

function stickerName(filename: string): string {
  return filename.replace(/\.[^.]+$/, '').replace(/-/g, ' ')
}

export default function Stickers({ stickers, heading, intro }: Props) {
  // Clicking a sticker opens an enlarged preview instead of leaving the site.
  // Visitors only go to Sticker Mule when they explicitly choose to.
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!preview) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPreview(null) }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [preview])

  return (
    <Layout>
      <Head>
        <title>Stickers | OBGillustrator.com</title>
        <meta name="description" content="Original character sticker designs by Imad Obegi — Sasquatch in every situation. Available on Sticker Mule." />
      </Head>

      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-10">
        <p className="text-xs text-copper uppercase tracking-widest mb-4">Stickers</p>
        <h1 className="font-serif text-4xl sm:text-5xl text-ink mb-4 leading-tight">
          {heading}
        </h1>
        <p className="text-mist leading-relaxed mb-8">
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
              <button
                key={filename}
                onClick={() => setPreview(filename)}
                className="group flex flex-col items-center gap-2 touch-manipulation"
                aria-label={`View ${stickerName(filename)} larger`}
              >
                <div className="w-full aspect-square rounded-xl overflow-hidden bg-canvas/50 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center p-2">
                  <img
                    src={`/stickers/${filename}?v=5`}
                    alt={stickerName(filename)}
                    className="w-full h-full object-contain select-none"
                    draggable={false}
                  />
                </div>
                <p className="text-center text-[10px] text-mist leading-tight group-hover:text-copper transition-colors capitalize">
                  {stickerName(filename)}
                </p>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-center text-mist text-sm py-10">No stickers added yet.</p>
        )}

        <p className="mt-8 text-xs text-mist opacity-60 text-center">More designs available on Sticker Mule</p>
      </div>

      {/* Sticker preview — enlarge on click; leaving the site is an explicit choice */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/85" onClick={() => setPreview(null)} />
          <div className="relative z-10 w-full max-w-md bg-panel shadow-2xl rounded-2xl overflow-hidden">
            <button
              onClick={() => setPreview(null)}
              className="absolute top-3 right-3 z-20 text-mist hover:text-edge transition-colors p-1"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-6 sm:p-8 flex items-center justify-center bg-canvas/30">
              <img
                src={`/stickers/${preview}?v=5`}
                alt={stickerName(preview)}
                className="w-full max-h-[50vh] object-contain select-none"
                draggable={false}
              />
            </div>

            <div className="px-6 pb-6 pt-4 text-center">
              <p className="text-edge capitalize font-serif text-lg mb-1">{stickerName(preview)}</p>
              <p className="text-xs text-mist mb-5">Stickers are sold through our partner, Sticker Mule.</p>
              <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
                <a
                  href={STICKER_MULE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-copper text-darkroom px-6 py-3 text-sm tracking-wider uppercase hover:bg-amber-600 transition-colors touch-manipulation"
                >
                  Shop on Sticker Mule
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <button
                  onClick={() => setPreview(null)}
                  className="inline-flex items-center justify-center px-6 py-3 text-sm tracking-wider uppercase border border-panel text-mist hover:border-mist hover:text-edge transition-colors touch-manipulation"
                >
                  Keep Browsing
                </button>
              </div>
              <p className="text-[10px] text-mist/60 mt-3">Opens stickermule.com in a new tab</p>
            </div>
          </div>
        </div>
      )}
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
