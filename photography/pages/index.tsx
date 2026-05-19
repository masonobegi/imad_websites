import { useState } from 'react'
import Link from 'next/link'
import Layout from '../components/Layout'
import ProductCard from '../components/ProductCard'
import ProductModal from '../components/ProductModal'
import CartPopup from '../components/CartPopup'
import { products, Product } from '../lib/products'

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const featured = products.slice(0, 3)

  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-[0.3em] text-copper mb-5">Fine Art Photography · Archival Prints</p>
          <h1 className="font-serif text-5xl md:text-6xl text-ink leading-tight mb-6">
            Photography<br />by Imad
          </h1>
          <p className="text-copper leading-relaxed text-base max-w-lg mx-auto mb-8">
            Places and moments worth holding onto. Each print is made on heavyweight archival paper
            and ships flat, carefully packed.
          </p>
          <Link
            href="/shop"
            className="inline-block border border-darkroom text-darkroom px-10 py-3 text-sm tracking-wider uppercase hover:bg-darkroom hover:text-canvas transition-colors"
          >
            View Prints
          </Link>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6">
        <div className="border-t border-edge" />
      </div>

      {/* About */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12 items-center">
          <div
            className="w-full md:w-80 flex-shrink-0 aspect-square rounded-sm flex items-center justify-center text-8xl"
            style={{ backgroundColor: '#DDD0BE60' }}
          >
            📷
          </div>
          <div className="max-w-sm">
            <h2 className="font-serif text-3xl text-ink mb-4">About the Prints</h2>
            <p className="text-copper leading-relaxed mb-4">
              Imad photographs landscapes, nature, and the occasional city scene. He is drawn to light —
              the way it changes through the day, across seasons, in weather you didn&apos;t plan to be out in.
            </p>
            <p className="text-copper leading-relaxed">
              Every print is made to order using archival pigment inks on heavyweight matte paper.
              They&apos;ll hold their color for decades if kept out of direct sunlight.
            </p>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="py-16 px-6" style={{ backgroundColor: '#DDD0BE30' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif text-3xl text-ink mb-8 text-center">Some Favorites</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            {featured.map(p => (
              <ProductCard key={p.id} product={p} onSelect={setSelectedProduct} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/shop"
              className="text-sm text-shadow hover:text-ink transition-colors border-b border-shadow/40 pb-0.5"
            >
              See all prints →
            </Link>
          </div>
        </div>
      </section>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddedToCart={() => { setSelectedProduct(null); setCartOpen(true) }}
        />
      )}
      {cartOpen && <CartPopup onClose={() => setCartOpen(false)} />}
    </Layout>
  )
}
