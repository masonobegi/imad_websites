import Link from 'next/link'
import Layout from '../components/Layout'

export default function Home() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-5 py-14 sm:py-20">

        {/* Header */}
        <div className="mb-12 sm:mb-16">
          <h1 className="font-serif text-4xl sm:text-5xl text-ink mb-3">Imad</h1>
          <p className="text-mist text-base leading-relaxed max-w-md">
            Artist, photographer, maker. Three bodies of work — one person behind all of it.
          </p>
        </div>

        {/* Three options */}
        <div className="space-y-0">

          {/* Photography */}
          <Link href="/shop" className="group flex items-center justify-between py-7 sm:py-8 border-t border-edge">
            <div>
              <p className="font-serif text-2xl sm:text-3xl text-ink group-hover:text-shadow transition-colors mb-1">Photography</p>
              <p className="text-sm text-mist">Nature · San Francisco Bay · Fine art prints on metal or canvas</p>
            </div>
            <svg className="w-5 h-5 text-mist group-hover:text-copper transition-colors flex-shrink-0 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          {/* Fine Art */}
          <Link href="/fine-art" className="group flex items-center justify-between py-7 sm:py-8 border-t border-edge">
            <div>
              <p className="font-serif text-2xl sm:text-3xl text-ink group-hover:text-shadow transition-colors mb-1">Fine Art</p>
              <p className="text-sm text-mist">Oil and encaustic paintings · Original works and limited prints</p>
            </div>
            <svg className="w-5 h-5 text-mist group-hover:text-copper transition-colors flex-shrink-0 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          {/* Stickers */}
          <Link href="/stickers" className="group flex items-center justify-between py-7 sm:py-8 border-t border-b border-edge">
            <div>
              <p className="font-serif text-2xl sm:text-3xl text-ink group-hover:text-shadow transition-colors mb-1">AI Stickers</p>
              <p className="text-sm text-mist">Original character designs · Packs and singles</p>
            </div>
            <svg className="w-5 h-5 text-mist group-hover:text-copper transition-colors flex-shrink-0 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <p className="text-xs text-mist mt-10">OBGillustrator.com</p>
      </div>
    </Layout>
  )
}
