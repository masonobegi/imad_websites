import { useState } from 'react'
import { StickerProduct } from '../lib/products'
import { useCart } from './CartContext'

interface ProductModalProps {
  product: StickerProduct
  onClose: () => void
  onAddedToCart: () => void
}

export default function ProductModal({ product, onClose, onAddedToCart }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()

  const handleAdd = () => {
    addItem({
      productId: product.id,
      productName: product.name,
      packSize: product.packSize,
      price: product.price,
      quantity,
      emoji: product.emoji,
    })
    onClose()
    onAddedToCart()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-ink/30" onClick={onClose} />
      <div className="relative bg-canvas max-w-lg w-full shadow-2xl p-8 rounded-xl max-h-[90vh] overflow-y-auto">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-amber hover:text-ink transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div
          className="w-full aspect-video flex items-center justify-center text-8xl mb-6 rounded-xl"
          style={{ backgroundColor: product.color + '22' }}
        >
          {product.emoji}
        </div>

        <h2 className="text-2xl font-bold text-ink">{product.name}</h2>
        <p className="text-xs text-amber font-semibold uppercase tracking-wider mt-1">{product.packSize}</p>
        <p className="text-sm text-ink mt-3 leading-relaxed">{product.description}</p>
        <p className="text-xs text-amber mt-3">
          Vinyl stickers, waterproof, slightly matte finish. Great for water bottles, laptops, notebooks — anything.
        </p>

        <div className="mt-6 p-4 bg-peach/40 rounded-lg">
          <p className="text-sm font-semibold text-ink">${product.price.toFixed(2)} per pack</p>
        </div>

        <div className="mt-5">
          <p className="text-xs text-amber uppercase tracking-wider font-semibold mb-3">How many packs?</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="w-9 h-9 border border-peach text-amber hover:border-ember hover:text-ember flex items-center justify-center text-lg transition-colors rounded-lg"
            >
              −
            </button>
            <span className="text-ink text-lg font-semibold w-8 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(q => q + 1)}
              className="w-9 h-9 border border-peach text-amber hover:border-ember hover:text-ember flex items-center justify-center text-lg transition-colors rounded-lg"
            >
              +
            </button>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between pt-4 border-t border-peach">
          <p className="text-ink">
            <span className="text-amber text-sm">Total </span>
            <span className="text-2xl font-bold">${(product.price * quantity).toFixed(2)}</span>
          </p>
          <button
            onClick={handleAdd}
            className="bg-ember text-canvas px-8 py-3 text-sm font-semibold tracking-wide rounded-lg hover:bg-rust transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}
