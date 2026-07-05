import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { GetServerSideProps } from 'next'
import Layout from '../../components/Layout'
import WorkModal, { Work } from '../../components/WorkModal'

// Returns true when width/height ratio >= 2.5 (panoramic, e.g. 6"×24")
function isPanoramic(originalSize: string | null | undefined): boolean {
  if (!originalSize) return false
  const nums = originalSize.match(/\d+(?:\.\d+)?/g)
  if (!nums || nums.length < 2) return false
  const a = parseFloat(nums[0]), b = parseFloat(nums[1])
  if (!a || !b) return false
  return Math.max(a, b) / Math.min(a, b) >= 2.5
}

interface Props {
  category: string
  categoryLabel: string
  categoryDescription: string
  encausticsHeaderText: string
  works: Work[]
}

export default function FineArtCategory({ category, categoryLabel, categoryDescription, encausticsHeaderText, works }: Props) {
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

        {/* Encaustics special notice */}
        {category === 'encaustics' && encausticsHeaderText && (
          <div className="mb-8 px-5 py-4 border-l-2 border-copper bg-copper/5">
            <p className="text-sm text-ink leading-relaxed">{encausticsHeaderText}</p>
            <Link href="/commissions" className="inline-block mt-3 text-xs text-copper uppercase tracking-widest hover:underline">
              Request a commission →
            </Link>
          </div>
        )}

        {/* Unified masonry — 3 cols, visible titles, panoramic pieces span full width */}
        <div className="art-grid">
          {displayed.map((work, i) => {
            const wide = isPanoramic(work.originalSize)
            return (
              <div key={work.id} className={wide ? 'art-item--full' : 'art-item'}>
                <button
                  onClick={() => setSelectedIndex(i)}
                  className="group block w-full text-left focus:outline-none"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={`/fine-art/${category}/${work.filename}`}
                      alt={work.title}
                      className="w-full block transition-transform duration-700 group-hover:scale-[1.02] select-none"
                      draggable={false}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-500" />
                  </div>
                  <div className="pt-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-serif text-sm text-ink leading-snug">{work.title}</p>
                      {work.available && (
                        <span className="text-[9px] border border-copper text-copper px-1.5 py-0.5 uppercase tracking-widest flex-shrink-0 mt-0.5">
                          For Sale
                        </span>
                      )}
                    </div>
                    {work.originalSize && (
                      <p className="text-mist text-[11px] mt-0.5">{work.originalSize}</p>
                    )}
                  </div>
                </button>
              </div>
            )
          })}
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

const CATEGORY_META: Record<string, { label: string; type: string; configKey: 'watercolorsDescription' | 'encausticsDescription' | 'oilsDescription' }> = {
  watercolors: { label: 'Watercolors',   type: 'watercolor', configKey: 'watercolorsDescription' },
  encaustics:  { label: 'Encaustics',    type: 'encaustic',  configKey: 'encausticsDescription' },
  oils:        { label: 'Oil Paintings', type: 'oil',        configKey: 'oilsDescription' },
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const category = params?.category as string
  const meta = CATEGORY_META[category]
  if (!meta) return { notFound: true }

  const { prisma } = await import('../../lib/prisma')
  const { readSiteConfig } = await import('../../lib/siteConfig')

  const [works, siteConfig] = await Promise.all([
    prisma.fineArtWork.findMany({
      where: { type: meta.type },
      include: { pleinAirImages: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { sortOrder: 'asc' },
    }),
    readSiteConfig(),
  ])

  return {
    props: {
      category,
      categoryLabel: meta.label,
      categoryDescription: siteConfig.fineArt[meta.configKey],
      encausticsHeaderText: siteConfig.encaustics.headerText,
      works: works.map(w => ({
        id: w.id, filename: w.filename, title: w.title, description: w.description,
        originalSize: w.originalSize, available: w.available, price: w.price,
        reprintAvailable: w.reprintAvailable, reprintPrice: w.reprintPrice, reprintMedium: w.reprintMedium,
        processImages: w.pleinAirImages.map(p => ({ id: p.id, filename: p.filename, title: p.title })),
      })),
    },
  }
}
