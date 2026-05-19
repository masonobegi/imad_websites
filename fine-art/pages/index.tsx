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
          <p className="text-xs uppercase tracking-[0.3em] text-clay mb-5">Original Artwork · Made by Hand</p>
          <h1 className="font-serif text-5xl md:text-6xl text-ink leading-tight mb-6">
            Oil &amp; Encaustic<br />Paintings
          </h1>
          <p className="text-clay leading-relaxed text-base max-w-lg mx-auto mb-8">
            Each piece starts with a blank canvas and ends with something you can live with for years.
            Not prints. Not reproductions. Originals, painted slowly, in a small studio.
          </p>
          <Link
            href="/shop"
            className="inline-block border border-bark text-bark px-10 py-3 text-sm tracking-wider uppercase hover:bg-bark hover:text-canvas transition-colors"
          >
            Browse the Shop
          </Link>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6">
        <div className="border-t border-linen" />
      </div>

      {/* About */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12 items-center">
          <div
            className="w-full md:w-80 flex-shrink-0 aspect-square rounded-sm flex items-center justify-center text-8xl"
            style={{ backgroundColor: '#E8DDD080' }}
          >
            🎨
          </div>
          <div className="max-w-sm">
            <h2 className="font-serif text-3xl text-ink mb-4">About the Work</h2>
            <p className="text-clay leading-relaxed mb-4">
              Imad has been painting for over fifteen years, working in oil and encaustic wax. His subjects
              come from the natural world — seasons, fields, the way morning light sits differently depending
              on the time of year.
            </p>
            <p className="text-clay leading-relaxed">
              Every piece is made to order and ships within two to three weeks. Originals come signed and
              with a certificate of authenticity.
            </p>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="py-16 px-6" style={{ backgroundColor: '#E8DDD030' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif text-3xl text-ink mb-8 text-center">A Few Recent Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            {featured.map(p => (
              <ProductCard key={p.id} product={p} onSelect={setSelectedProduct} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/shop"
              className="text-sm text-bark hover:text-sienna transition-colors border-b border-bark/40 pb-0.5"
            >
              See all paintings →
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
