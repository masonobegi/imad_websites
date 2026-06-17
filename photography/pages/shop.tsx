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

export default function Shop({ categories, previews, counts }: Props) {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10 pb-6 border-b border-edge">
          <h1 className="font-serif text-4xl text-ink">Shop</h1>
          <p className="text-mist mt-2 text-sm">Choose a collection to browse prints.</p>
        </div>

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
                    <div className="w-full h-full bg-panel flex items-center justify-center">
                      <span className="text-mist text-sm">No photos yet</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/5 transition-colors" />
                </div>
                <h2 className="font-serif text-2xl text-ink mb-1">{cat.label}</h2>
                <p className="text-mist text-sm leading-relaxed">{cat.description}</p>
                <p className="text-copper text-xs mt-2 uppercase tracking-wider">
                  {counts[slug] || 0} photographs →
                </p>
              </Link>
            )
          })}
        </div>
      </div>
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
