import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useState } from 'react'
import Layout from '../components/Layout'
import { prisma } from '../lib/prisma'

interface ProcessImage {
  id: string
  filename: string
}

interface ProcessEntry {
  id: string
  title: string
  description: string
  images: ProcessImage[]
}

interface Props {
  entries: ProcessEntry[]
}

export default function ProcessPage({ entries }: Props) {
  const [lightboxEntry, setLightboxEntry] = useState<ProcessEntry | null>(null)
  const [lightboxIdx, setLightboxIdx] = useState(0)

  function openLightbox(entry: ProcessEntry, idx: number) {
    setLightboxEntry(entry)
    setLightboxIdx(idx)
  }

  function closeLightbox() {
    setLightboxEntry(null)
  }

  return (
    <Layout>
      <Head>
        <title>Art Process — OBGillustrator</title>
      </Head>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h1 className="font-serif text-3xl sm:text-4xl text-ink mb-3 text-center">Art Process</h1>
        <p className="text-mist text-center mb-12 max-w-2xl mx-auto">
          A look behind the scenes at how each piece comes to life.
        </p>

        {entries.length === 0 && (
          <p className="text-center text-mist">Coming soon.</p>
        )}

        <div className="space-y-16">
          {entries.map((entry) => (
            <section key={entry.id}>
              <h2 className="font-serif text-2xl text-ink mb-2">{entry.title}</h2>
              {entry.description && (
                <p className="text-mist text-base leading-relaxed mb-6 max-w-2xl">{entry.description}</p>
              )}
              {entry.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {entry.images.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => openLightbox(entry, idx)}
                      className="aspect-square overflow-hidden bg-edge/20 hover:opacity-90 transition-opacity"
                    >
                      <img
                        src={`/fine-art/process/${img.filename}?v=2`}
                        alt={`${entry.title} — step ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/90" onClick={closeLightbox} />
          <div className="relative z-10 max-w-4xl w-full mx-4">
            <button
              onClick={closeLightbox}
              className="absolute -top-10 right-0 text-white/70 hover:text-white text-sm"
            >
              Close ✕
            </button>
            <img
              src={`/fine-art/process/${lightboxEntry.images[lightboxIdx].filename}?v=2`}
              alt={lightboxEntry.title}
              className="w-full max-h-[80vh] object-contain"
            />
            {lightboxEntry.images.length > 1 && (
              <div className="flex justify-center gap-2 mt-3">
                {lightboxEntry.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setLightboxIdx(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${i === lightboxIdx ? 'bg-copper' : 'bg-white/40 hover:bg-white/70'}`}
                  />
                ))}
              </div>
            )}
            <p className="text-center text-white/70 text-sm mt-2">
              {lightboxIdx + 1} / {lightboxEntry.images.length}
            </p>
          </div>
        </div>
      )}
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const entries = await prisma.artProcess.findMany({
    include: { images: { orderBy: { sortOrder: 'asc' } } },
    orderBy: { sortOrder: 'asc' },
  })

  return {
    props: {
      entries: entries.map(e => ({
        id: e.id,
        title: e.title,
        description: e.description,
        images: e.images.map(i => ({ id: i.id, filename: i.filename })),
      })),
    },
  }
}
