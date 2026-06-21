import fs from 'fs'
import path from 'path'
import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { GetServerSideProps } from 'next'
import Layout from '../../components/Layout'
import WorkModal, { Work } from '../../components/WorkModal'

interface Props {
  category: string
  categoryLabel: string
  categoryDescription: string
  works: Work[]
}

export default function FineArtCategory({ category, categoryLabel, categoryDescription, works }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [filter, setFilter] = useState<'all' | 'available'>('all')

  const availableCount = works.filter(w => w.available).length
  const displayed = filter === 'available' ? works.filter(w => w.available) : works

  return (
    <Layout>
      <Head>
        <title>{categoryLabel} | Fine Art | OBGillustrator.com</title>
        <meta name="description" content={categoryDescription} />
        <meta property="og:title" content={`${categoryLabel} by Imad Obegi`} />
        <meta property="og:description" content={categoryDescription} />
        {works[0] && <meta property="og:image" content={`https://obgillustrator.com/fine-art/${category}/${works[0].filename}`} />}
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-16">
        <div className="mb-6">
          <p className="text-xs text-mist mb-3">
            <Link href="/fine-art" className="hover:text-copper transition-colors">Fine Art</Link>
            <span className="mx-2 opacity-40">›</span>
            {categoryLabel}
          </p>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl text-ink">{categoryLabel}</h1>
              <p className="text-mist text-sm mt-1 max-w-md">{categoryDescription}</p>
            </div>
            {availableCount > 0 && (
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => setFilter('all')}
                  className={`text-xs px-3 py-1.5 border transition-colors ${filter === 'all' ? 'border-copper text-copper' : 'border-edge text-mist hover:border-shadow'}`}
                >
                  All ({works.length})
                </button>
                <button
                  onClick={() => setFilter('available')}
                  className={`text-xs px-3 py-1.5 border transition-colors ${filter === 'available' ? 'border-copper text-copper' : 'border-edge text-mist hover:border-shadow'}`}
                >
                  Available ({availableCount})
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="photo-grid">
          {displayed.map((work, i) => (
              <div key={work.id} className="photo-item">
                <button
                  onClick={() => setSelectedIndex(i)}
                  className="group block w-full text-left focus:outline-none"
                >
                  <div className="relative overflow-hidden bg-edge">
                    <img
                      src={`/fine-art/${category}/${work.filename}`}
                      alt={work.title}
                      className="w-full block transition-transform duration-500 group-hover:scale-[1.03] select-none"
                      draggable={false}
                      loading="lazy"
                    />
                    {work.available && (
                      <div className="absolute top-2 left-2">
                        <span className="text-[10px] bg-copper text-darkroom px-1.5 py-0.5 uppercase tracking-wider font-medium">
                          Available
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
      </div>

      {selectedIndex !== null && (
        <WorkModal
          works={displayed}
          initialIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          category={category}
          categoryLabel={categoryLabel}
        />
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
