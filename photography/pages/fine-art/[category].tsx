import fs from 'fs'
import path from 'path'
import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { GetServerSideProps } from 'next'
import Layout from '../../components/Layout'

interface Work {
  id: string
  filename: string
  title: string
  originalSize: string | null
  description: string
}

interface Props {
  category: string
  categoryLabel: string
  categoryDescription: string
  works: Work[]
}

export default function FineArtCategory({ category, categoryLabel, categoryDescription, works }: Props) {
  const [selected, setSelected] = useState<Work | null>(null)

  return (
    <Layout>
      <Head>
        <title>{categoryLabel} | Fine Art | OBGillustrator.com</title>
        <meta name="description" content={categoryDescription} />
        <meta property="og:title" content={`${categoryLabel} by Imad Obegi`} />
        <meta property="og:description" content={categoryDescription} />
        {works[0] && <meta property="og:image" content={`/fine-art/${category}/${works[0].filename}`} />}
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-16">
        <div className="mb-8">
          <p className="text-xs text-mist mb-3">
            <Link href="/fine-art" className="hover:text-copper transition-colors">Fine Art</Link>
            <span className="mx-2 opacity-40">›</span>
            {categoryLabel}
          </p>
          <h1 className="font-serif text-3xl text-ink">{categoryLabel}</h1>
          <p className="text-mist text-sm mt-1 max-w-md">{categoryDescription}</p>
        </div>

        {/* Masonry grid */}
        <div className="photo-grid">
          {works.map(work => (
            <div key={work.id} className="photo-item">
              <button
                onClick={() => setSelected(work)}
                className="group block w-full text-left focus:outline-none"
              >
                <div className="relative overflow-hidden bg-edge">
                  <img
                    src={`/fine-art/${category}/${work.filename}`}
                    alt={work.title}
                    className="w-full block transition-transform duration-500 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
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
      </div>

      {/* Detail overlay */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 sm:p-8"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-canvas max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col sm:flex-row"
            onClick={e => e.stopPropagation()}
          >
            {/* Image */}
            <div className="sm:w-3/5 bg-edge flex-shrink-0">
              <img
                src={`/fine-art/${category}/${selected.filename}`}
                alt={selected.title}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Info */}
            <div className="flex-1 p-6 sm:p-8 flex flex-col">
              <button
                onClick={() => setSelected(null)}
                className="self-end text-mist hover:text-ink transition-colors mb-6 text-lg leading-none"
                aria-label="Close"
              >
                ×
              </button>

              <p className="text-xs text-copper uppercase tracking-widest mb-2">{categoryLabel}</p>
              <h2 className="font-serif text-2xl sm:text-3xl text-ink mb-4 leading-tight">{selected.title}</h2>

              <p className="text-mist text-sm leading-relaxed mb-6">{selected.description}</p>

              <div className="mt-auto space-y-3 pt-4 border-t border-edge text-sm">
                {selected.originalSize && (
                  <div className="flex justify-between text-mist">
                    <span>Original size</span>
                    <span>{selected.originalSize}</span>
                  </div>
                )}
                <div className="flex justify-between text-mist">
                  <span>Price</span>
                  <span>Contact for pricing</span>
                </div>
              </div>

              <a
                href={`mailto:imadobegi@gmail.com?subject=Inquiry: ${encodeURIComponent(selected.title)}&body=Hi Imad,%0A%0AI'm interested in "${selected.title}". Could you share more details on availability and pricing?%0A%0AThank you`}
                className="mt-6 block text-center border border-ink text-ink px-6 py-3 text-sm tracking-wider uppercase hover:bg-ink hover:text-canvas transition-colors"
              >
                Inquire about this piece
              </a>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const category = params?.category as string
  const dataPath = path.join(process.cwd(), 'public', 'fine-art', 'data.json')
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
  const cat = data.categories[category]
  if (!cat) return { notFound: true }
  return {
    props: {
      category,
      categoryLabel: cat.label,
      categoryDescription: cat.description,
      works: data.works[category] || [],
    },
  }
}
