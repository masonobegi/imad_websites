import fs from 'fs'
import path from 'path'
import Link from 'next/link'
import { GetServerSideProps } from 'next'
import Layout from '../components/Layout'

interface CategoryMeta { label: string; description: string }
interface Photo { id: string; filename: string; title: string; description: string; category: string }

interface Props {
  categories: Record<string, CategoryMeta>
  previews: Record<string, Photo | null>
  counts: Record<string, number>
}

export default function Home({ categories, previews, counts }: Props) {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <h1 className="font-serif text-5xl md:text-6xl text-ink leading-tight mb-5">
            Photographs<br />by Imad
          </h1>
          <p className="text-mist leading-relaxed text-base max-w-sm mx-auto mb-8">
            Thirty years with a camera — from the Mojave at midnight to the fog over San Francisco Bay.
            Every print is made to order and ships flat.
          </p>
          <Link href="/shop" className="inline-block border border-ink text-ink px-10 py-3 text-sm tracking-wider uppercase hover:bg-ink hover:text-canvas transition-colors">
            Browse Prints
          </Link>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-edge" />
      </div>

      {/* Collections */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs text-mist uppercase tracking-widest mb-8">Collections</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {Object.entries(categories).map(([slug, cat]) => {
              const preview = previews[slug]
              return (
                <Link key={slug} href={`/photos/${slug}`} className="group block">
                  <div className="bg-darkroom aspect-[4/3] mb-4 overflow-hidden relative photo-wrapper">
                    {preview ? (
                      <img
                        src={`/photos/${slug}/${preview.filename}`}
                        alt={cat.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 photo-protected"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-panel">
                        <span className="text-mist text-sm">Loading...</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  </div>
                  <h2 className="font-serif text-2xl text-ink mb-1">{cat.label}</h2>
                  <p className="text-mist text-sm leading-relaxed">{cat.description}</p>
                  <p className="text-copper text-xs mt-2 uppercase tracking-wider">
                    {counts[slug] || 0} prints available →
                  </p>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-edge" />
      </div>

      {/* About */}
      <section className="py-16 px-6">
        <div className="max-w-xl mx-auto">
          <h2 className="font-serif text-2xl text-ink mb-5">About the prints</h2>
          <p className="text-mist text-sm leading-relaxed mb-3">
            These are places Imad has actually been, light he waited for, moments that don't repeat.
            Each print is made on archival paper with pigment inks — the same process used by museums.
            Colors hold for decades out of direct sunlight.
          </p>
          <p className="text-mist text-sm leading-relaxed mb-8">
            Available on metal or canvas in five sizes. Framing is your call. Shipping included anywhere in the US.
          </p>
          <div className="flex gap-6">
            <Link href="/shop" className="text-sm text-copper border-b border-copper/30 pb-0.5 hover:border-copper transition-colors">
              See all prints
            </Link>
            <a
              href={process.env.NEXT_PUBLIC_FINEART_URL || '#'}
              className="text-sm text-mist border-b border-mist/30 pb-0.5 hover:border-mist transition-colors"
            >
              Paintings
            </a>
            <a
              href={process.env.NEXT_PUBLIC_STICKERS_URL || '#'}
              className="text-sm text-mist border-b border-mist/30 pb-0.5 hover:border-mist transition-colors"
            >
              AI Stickers
            </a>
          </div>
        </div>
      </section>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const dataPath = path.join(process.cwd(), 'public', 'photos', 'data.json')
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
  return {
    props: {
      categories: data.categories,
      previews: Object.fromEntries(
        Object.entries(data.photos as Record<string, Photo[]>).map(([slug, items]) => [slug, items[0] ?? null])
      ),
      counts: Object.fromEntries(
        Object.entries(data.photos as Record<string, Photo[]>).map(([slug, items]) => [slug, items.length])
      ),
    },
  }
}
