import { useState, useEffect, useCallback } from 'react'
import { Photo, PRINT_SIZES, PRINT_MEDIUMS, PrintMedium } from '../lib/photos'
import { useCart } from './CartContext'

interface PhotoModalProps {
  photos: Photo[]
  initialIndex: number
  onClose: () => void
  onAddedToCart: () => void
}

export default function PhotoModal({ photos, initialIndex, onClose, onAddedToCart }: PhotoModalProps) {
  const [idx, setIdx] = useState(initialIndex)
  const [sizeIdx, setSizeIdx] = useState(0)
  const [medium, setMedium] = useState<PrintMedium>('Metal')
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()

  const photo = photos[idx]
  const selectedSize = PRINT_SIZES[sizeIdx]
  const hasPrev = idx > 0
  const hasNext = idx < photos.length - 1

  const goPrev = useCallback(() => {
    if (hasPrev) { setIdx(i => i - 1); setAdded(false) }
  }, [hasPrev])

  const goNext = useCallback(() => {
    if (hasNext) { setIdx(i => i + 1); setAdded(false) }
  }, [hasNext])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, goPrev, goNext])

  const handleAdd = () => {
    addItem({
      productId: photo.id,
      productName: photo.title,
      category: photo.category,
      size: selectedSize.label,
      medium,
      price: selectedSize.price,
      quantity,
      image: photo.filename,
    })
    setAdded(true)
    setTimeout(() => {
      onClose()
      onAddedToCart()
    }, 600)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/85" onClick={onClose} />

      <div className="relative z-10 w-full max-w-5xl mx-4 bg-panel shadow-2xl flex flex-col md:flex-row max-h-[90vh]">

        {/* Photo + nav arrows */}
        <div className="md:w-[62%] flex-shrink-0 bg-darkroom flex items-center justify-center relative photo-wrapper">
          <img
            src={`/photos/${photo.category}/${photo.filename}`}
            alt={photo.title}
            className="w-full h-full object-contain max-h-[55vh] md:max-h-[90vh] photo-protected"
            draggable={false}
          />

          {/* Prev button */}
          {hasPrev && (
            <button
              onClick={e => { e.stopPropagation(); goPrev() }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/75 text-white flex items-center justify-center transition-colors z-10"
              aria-label="Previous photo"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Next button */}
          {hasNext && (
            <button
              onClick={e => { e.stopPropagation(); goNext() }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/75 text-white flex items-center justify-center transition-colors z-10"
              aria-label="Next photo"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Counter */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center">
            <span className="text-xs text-white/50 bg-black/40 px-2 py-0.5">
              {idx + 1} / {photos.length}
            </span>
          </div>
        </div>

        {/* Info panel */}
        <div className="md:w-[38%] flex flex-col overflow-y-auto">
          <div className="p-7 flex-1">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-mist hover:text-edge transition-colors z-20"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <p className="text-xs text-copper uppercase tracking-widest mb-2">Fine Art Print</p>
            <h2 className="font-serif text-xl text-edge leading-snug mb-4">{photo.title}</h2>
            <p className="text-mist text-sm leading-relaxed mb-6">{photo.description}</p>
            <p className="text-xs text-mist mb-6">Archival pigment print. Shipping included in the US.</p>

            {/* Size */}
            <div className="mb-5">
              <p className="text-xs text-mist uppercase tracking-widest mb-3">Size</p>
              <div className="space-y-1.5">
                {PRINT_SIZES.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setSizeIdx(i)}
                    className={`w-full flex justify-between items-center px-3 py-2.5 text-sm transition-colors ${
                      sizeIdx === i
                        ? 'bg-copper/15 border border-copper text-edge'
                        : 'border border-panel text-mist hover:border-mist'
                    }`}
                  >
                    <span>{s.label}</span>
                    <span className={sizeIdx === i ? 'text-copper font-medium' : 'text-mist'}>${s.price}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Medium */}
            <div className="mb-5">
              <p className="text-xs text-mist uppercase tracking-widest mb-3">Medium</p>
              <div className="flex gap-2">
                {PRINT_MEDIUMS.map(m => (
                  <button
                    key={m}
                    onClick={() => setMedium(m)}
                    className={`flex-1 py-2.5 text-sm border transition-colors ${
                      medium === m
                        ? 'border-copper bg-copper/15 text-edge'
                        : 'border-panel text-mist hover:border-mist'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <p className="text-xs text-mist uppercase tracking-widest mb-3">Quantity</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-8 h-8 border border-panel text-mist hover:border-mist hover:text-edge flex items-center justify-center transition-colors">−</button>
                <span className="text-edge w-6 text-center">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="w-8 h-8 border border-panel text-mist hover:border-mist hover:text-edge flex items-center justify-center transition-colors">+</button>
              </div>
            </div>
          </div>

          {/* Add to cart footer */}
          <div className="p-7 pt-0">
            <div className="flex items-center justify-between mb-4 pt-4 border-t border-darkroom">
              <p className="text-edge">
                <span className="text-mist text-sm">Total </span>
                <span className="font-serif text-xl">${(selectedSize.price * quantity).toFixed(2)}</span>
              </p>
            </div>
            <button
              onClick={handleAdd}
              disabled={added}
              className={`w-full py-3 text-sm tracking-wider uppercase transition-all ${
                added
                  ? 'bg-copper/60 text-darkroom cursor-default'
                  : 'bg-copper text-darkroom hover:bg-amber-600'
              }`}
            >
              {added ? 'Added ✓' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
