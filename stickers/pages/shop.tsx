import { useState } from 'react'
import Layout from '../components/Layout'
import ProductCard from '../components/ProductCard'
import ProductModal from '../components/ProductModal'
import CartPopup from '../components/CartPopup'
import { products, StickerProduct } from '../lib/products'

export default function Shop() {
  const [selectedProduct, setSelectedProduct] = useState<StickerProduct | null>(null)
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10 pb-6 border-b border-peach">
          <h1 className="text-4xl font-bold text-ink">All Packs</h1>
          <p className="text-amber mt-2 text-sm">
            Click any pack to see what&apos;s inside and add to cart.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-12">
          {products.map(p => (
            <ProductCard key={p.id} product={p} onSelect={setSelectedProduct} />
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-peach text-center text-sm text-amber">
          <p>All sticker packs ship in a rigid mailer within 5–7 business days.</p>
        </div>
      </div>

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
