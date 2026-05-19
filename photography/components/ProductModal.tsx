import { useState } from 'react'
import { Product } from '../lib/products'
import { useCart } from './CartContext'

interface ProductModalProps {
  product: Product
  onClose: () => void
  onAddedToCart: () => void
}

export default function ProductModal({ product, onClose, onAddedToCart }: ProductModalProps) {
  const [selectedSizeIdx, setSelectedSizeIdx] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()

  const selectedSize = product.sizes[selectedSizeIdx]

  const handleAdd = () => {
    addItem({
      productId: product.id,
      productName: product.name,
      category: product.category,
      size: selectedSize.label,
      price: selectedSize.price,
      quantity,
      emoji: product.emoji,
    })
    onClose()
    onAddedToCart()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-ink/30" onClick={onClose} />
      <div className="relative bg-canvas max-w-lg w-full shadow-2xl p-8 rounded-sm max-h-[90vh] overflow-y-auto">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-copper hover:text-ink transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div
          className="w-full aspect-video flex items-center justify-center text-8xl mb-6 rounded-sm"
          style={{ backgroundColor: product.color + '28' }}
        >
          {product.emoji}
        </div>

        <h2 className="font-serif text-2xl text-ink">{product.name}</h2>
        <p className="text-xs text-copper uppercase tracking-widest mt-1">{product.category}</p>
        <p className="text-sm text-ink mt-3 leading-relaxed">{product.description}</p>
        <p className="text-xs text-copper mt-3">Archival pigment print on heavyweight matte paper. Ships flat, carefully packed.</p>

        <div className="mt-6">
          <p className="text-xs text-copper uppercase tracking-widest mb-3">Print Size</p>
          <div className="space-y-2">
            {product.sizes.map((size, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedSizeIdx(idx)}
                className={`w-full flex justify-between items-center px-4 py-3 border text-sm transition-colors ${
                  selectedSizeIdx === idx
                    ? 'border-darkroom bg-darkroom/5 text-ink'
                    : 'border-edge text-copper hover:border-copper'
                }`}
              >
                <span>{size.label}</span>
                <span className={selectedSizeIdx === idx ? 'font-medium text-darkroom' : 'text-copper'}>
                  ${size.price}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <p className="text-xs text-copper uppercase tracking-widest mb-3">Quantity</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="w-8 h-8 border border-edge text-copper hover:border-darkroom hover:text-darkroom flex items-center justify-center transition-colors"
            >
              −
            </button>
            <span className="text-ink w-6 text-center font-medium">{quantity}</span>
            <button
              onClick={() => setQuantity(q => q + 1)}
              className="w-8 h-8 border border-edge text-copper hover:border-darkroom hover:text-darkroom flex items-center justify-center transition-colors"
            >
              +
            </button>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between pt-4 border-t border-edge">
          <p className="text-ink">
            <span className="text-copper text-sm">Total </span>
            <span className="font-serif text-xl">${(selectedSize.price * quantity).toFixed(2)}</span>
          </p>
          <button
            onClick={handleAdd}
            className="bg-darkroom text-canvas px-8 py-3 text-sm tracking-wider uppercase hover:bg-shadow transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}
