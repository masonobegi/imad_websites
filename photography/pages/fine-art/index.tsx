import fs from 'fs'
import path from 'path'
import Head from 'next/head'
import Link from 'next/link'
import { GetServerSideProps } from 'next'
import Layout from '../../components/Layout'

interface Category {
  key: string
  label: string
  description: string
  previewImages: string[]
  count: number
}

interface Props {
  categories: Category[]
}

export default function FineArt({ categories }: Props) {
  return (
    <Layout>
      <Head>
        <title>Fine Art | OBGillustrator.com</title>
        <meta name="description" content="Fine art works by Imad Obegi — watercolors, oils, encaustic paintings, and more." />
        <meta property="og:title" content="Fine Art | OBGillustrator.com" />
        <meta property="og:description" content="Original paintings by Imad Obegi — watercolors, oils, and encaustic works." />
      </Head>

      <div className="max-w-6xl mx-auto px-5 sm:px-10 py-12 sm:py-16">
        <div className="mb-10">
          <p className="text-xs text-copper uppercase tracking-widest mb-3">Fine Art</p>
          <h1 className="font-serif text-4xl sm:text-5xl text-ink mb-3">Original Works</h1>
          <p className="text-mist text-sm max-w-md">
            Paintings across watercolor, oil, encaustic, and pastel — each one an original, made over time.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(cat => (
            <Link
              key={cat.key}
              href={`/fine-art/${cat.key}`}
              className="group border border-edge hover:border-shadow transition-colors"
            >
              {/* Preview grid */}
              <div className="grid grid-cols-2 gap-0.5 bg-edge aspect-[4/3] overflow-hidden">
                {cat.previewImages.slice(0, 4).map((src, i) => (
                  <div key={i} className="overflow-hidden bg-canvas">
                    <img
                      src={src}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ))}
              </div>
              <div className="px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-ink text-base font-medium">{cat.label}</p>
                  <p className="text-mist text-xs mt-0.5">{cat.count} works</p>
                </div>
                <svg className="w-4 h-4 text-mist group-hover:text-copper transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}

            {/* Oil Paintings placeholder */}
          <div className="border border-edge opacity-40">
            <div className="aspect-[4/3] bg-edge/30 flex items-center justify-center">
              <p className="text-mist text-xs uppercase tracking-widest">Coming soon</p>
            </div>
            <div className="px-5 py-4">
              <p className="text-ink text-base font-medium">Oil Paintings</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const dataPath = path.join(process.cwd(), 'public', 'fine-art', 'data.json')
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))

  const categories: Category[] = Object.entries(data.categories as Record<string, { label: string; description: string }>).map(
    ([key, meta]) => {
      const works: { filename: string }[] = data.works[key] || []
      return {
        key,
        label: meta.label,
        description: meta.description,
        previewImages: works.slice(0, 4).map(w => `/fine-art/${key}/${w.filename}`),
        count: works.length,
      }
    }
  )

  return { props: { categories } }
}
