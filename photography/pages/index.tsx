import Link from 'next/link'
import Layout from '../components/Layout'
import { CATEGORIES, photos } from '../lib/photos'

export default function Home() {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <p className="text-xs uppercase tracking-[0.3em] text-copper mb-5">Fine Art Photography</p>
          <h1 className="font-serif text-5xl md:text-6xl text-ink leading-tight mb-6">
            Photographs<br />by Imad
          </h1>
          <p className="text-mist leading-relaxed text-base max-w-sm mx-auto mb-8">
            Places worth holding onto, printed on archival paper.
            Each print is made to order and ships flat.
          </p>
          <Link href="/shop" className="inline-block border border-ink text-ink px-10 py-3 text-sm tracking-wider uppercase hover:bg-ink hover:text-canvas transition-colors">
            View the Work
          </Link>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-edge" />
      </div>

      {/* Categories */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
          {Object.entries(CATEGORIES).map(([slug, cat]) => {
            const preview = photos[slug]?.[0]
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
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-5xl opacity-30">{slug === 'nature' ? '🌿' : '🌉'}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                </div>
                <h2 className="font-serif text-2xl text-ink mb-1">{cat.label}</h2>
                <p className="text-mist text-sm leading-relaxed">{cat.description}</p>
                <p className="text-copper text-xs mt-2 uppercase tracking-wider">
                  {photos[slug]?.length || 0} photographs →
                </p>
              </Link>
            )
          })}
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-edge" />
      </div>

      {/* About */}
      <section className="py-16 px-6">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="font-serif text-2xl text-ink mb-4">About the Prints</h2>
          <p className="text-mist text-sm leading-relaxed mb-3">
            Every print is made on archival paper using pigment inks. The colors hold for decades
            if kept away from direct sunlight. Each one is made to order and ships flat, carefully packed.
          </p>
          <p className="text-mist text-sm leading-relaxed">
            Available in five sizes on metal or canvas. Shipping is included in the US.
          </p>
        </div>
      </section>
    </Layout>
  )
}
