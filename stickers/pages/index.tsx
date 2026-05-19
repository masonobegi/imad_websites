import { useState } from 'react'
import Link from 'next/link'
import Layout from '../components/Layout'
import ProductCard from '../components/ProductCard'
import ProductModal from '../components/ProductModal'
import CartPopup from '../components/CartPopup'
import { products, StickerProduct } from '../lib/products'

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<StickerProduct | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const featured = products.slice(0, 3)

  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-[0.3em] text-amber font-semibold mb-5">
            AI-Generated · Vinyl · Waterproof
          </p>
          <h1 className="text-5xl md:text-6xl font-bold text-ink leading-tight mb-6">
            Sticker Packs<br />by Imad
          </h1>
          <p className="text-amber leading-relaxed text-base max-w-lg mx-auto mb-8">
            Each pack is six stickers designed with AI and finished by hand.
            Vinyl, waterproof, and a little bit different from anything else out there.
          </p>
          <Link
            href="/shop"
            className="inline-block bg-ember text-canvas px-10 py-3 text-sm font-semibold tracking-wide rounded-lg hover:bg-rust transition-colors"
          >
            Browse Packs
          </Link>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6">
        <div className="border-t border-peach" />
      </div>

      {/* About */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12 items-center">
          <div
            className="w-full md:w-80 flex-shrink-0 aspect-square rounded-2xl flex items-center justify-center text-8xl"
            style={{ backgroundColor: '#FFD9A888' }}
          >
            ✨
          </div>
          <div className="max-w-sm">
            <h2 className="text-3xl font-bold text-ink mb-4">How They&apos;re Made</h2>
            <p className="text-amber leading-relaxed mb-4">
              Imad experiments with AI image tools to generate illustrated artwork — then curates, refines,
              and arranges the best ones into themed packs. No two packs are the same.
            </p>
            <p className="text-amber leading-relaxed">
              Each sticker is printed on durable vinyl with a slight matte finish.
              They&apos;re waterproof and hold up on laptops, water bottles, and pretty much anything else.
            </p>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="py-16 px-6" style={{ backgroundColor: '#FFD9A830' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-ink mb-8 text-center">Popular Packs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            {featured.map(p => (
              <ProductCard key={p.id} product={p} onSelect={setSelectedProduct} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/shop"
              className="text-sm text-ember hover:text-rust transition-colors border-b border-ember/40 pb-0.5 font-semibold"
            >
              See all packs →
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
