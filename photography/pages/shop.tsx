import { useState } from 'react'
import Layout from '../components/Layout'
import ProductCard from '../components/ProductCard'
import ProductModal from '../components/ProductModal'
import CartPopup from '../components/CartPopup'
import { products, Product } from '../lib/products'

export default function Shop() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10 pb-6 border-b border-edge">
          <h1 className="font-serif text-4xl text-ink">Prints</h1>
          <p className="text-copper mt-2 text-sm">
            Click any photograph to choose a print size and add to cart.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-12">
          {products.map(p => (
            <ProductCard key={p.id} product={p} onSelect={setSelectedProduct} />
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-edge text-center text-sm text-copper">
          <p>All prints are archival quality and made to order. They ship flat within 1–2 weeks.</p>
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
