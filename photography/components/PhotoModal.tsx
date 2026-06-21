import { useState, useEffect, useCallback } from 'react'
import { Photo, PRINT_SIZES as DEFAULT_PRINT_SIZES, PRINT_MEDIUMS, PrintMedium } from '../lib/photos'
import { useCart } from './CartContext'

interface PrintSize { label: string; price: number }

interface PhotoModalProps {
  photos: Photo[]
  initialIndex: number
  onClose: () => void
  onAddedToCart: () => void
  printSizes?: PrintSize[]
}

const LENS = 170
const ZOOM = 2.8

interface LensState { x: number; y: number; cw: number; ch: number }

export default function PhotoModal({ photos, initialIndex, onClose, onAddedToCart, printSizes }: PhotoModalProps) {
  const [idx, setIdx] = useState(initialIndex)
  const [sizeIdx, setSizeIdx] = useState(0)
  const [medium, setMedium] = useState<PrintMedium>('Metal')
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [lens, setLens] = useState<LensState | null>(null)
  const { addItem } = useCart()

  const PRINT_SIZES = printSizes || DEFAULT_PRINT_SIZES
  const photo = photos[idx]
  const selectedSize = PRINT_SIZES[sizeIdx]
  const hasPrev = idx > 0
  const hasNext = idx < photos.length - 1

  const goPrev = useCallback(() => { if (hasPrev) { setIdx(i => i - 1); setAdded(false); setLens(null) } }, [hasPrev])
  const goNext = useCallback(() => { if (hasNext) { setIdx(i => i + 1); setAdded(false); setLens(null) } }, [hasNext])


  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    setLens({ x: e.clientX - r.left, y: e.clientY - r.top, cw: e.currentTarget.offsetWidth, ch: e.currentTarget.offsetHeight })
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    document.addEventListener('keydown', onKey)
    // Prevent body scroll while modal open
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
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
    setTimeout(() => { onClose(); onAddedToCart() }, 600)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/85" onClick={onClose} />

      {/* Modal — full-screen on mobile, max-w constrained on desktop */}
      <div className="relative z-10 w-full sm:max-w-5xl sm:mx-4 bg-panel shadow-2xl flex flex-col sm:flex-row
                      h-[92vh] sm:h-auto sm:max-h-[90vh]
                      rounded-t-2xl sm:rounded-none"
>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 z-20 text-mist hover:text-edge transition-colors p-1"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Photo area — hover to magnify */}
        <div
          className="sm:w-[62%] flex-shrink-0 bg-darkroom relative photo-wrapper select-none touch-none h-[42vh] sm:h-auto sm:max-h-[90vh] overflow-hidden flex items-center justify-center"
          style={{ cursor: lens ? 'none' : 'crosshair' }}
          onPointerMove={handlePointerMove}
          onPointerLeave={(e) => { if (e.pointerType !== 'touch') setLens(null) }}
          onPointerUp={(e) => { if (e.pointerType !== 'touch') setLens(null) }}
        >
          <img
            src={`/photos/${photo.category}/${photo.filename}`}
            alt={photo.title}
            className="w-full h-full object-contain block select-none photo-protected"
            draggable={false}
          />

          {/* Magnifier lens (desktop) */}
          {lens && (
            <div
              className="absolute pointer-events-none z-20 border-2 border-white/70 shadow-[0_0_0_1px_rgba(0,0,0,0.15),0_4px_24px_rgba(0,0,0,0.55)]"
              style={{
                width: LENS, height: LENS, borderRadius: '50%',
                left: lens.x - LENS / 2,
                top: lens.y - LENS / 2,
                overflow: 'hidden',
              }}
            >
              <img
                src={`/photos/${photo.category}/${photo.filename}`}
                alt=""
                draggable={false}
                className="absolute select-none photo-protected"
                style={{
                  width: lens.cw * ZOOM, height: lens.ch * ZOOM,
                  objectFit: 'contain',
                  left: LENS / 2 - lens.x * ZOOM,
                  top: LENS / 2 - lens.y * ZOOM,
                  maxWidth: 'none', maxHeight: 'none',
                }}
              />
            </div>
          )}

          {!lens && (
            <div className="absolute bottom-10 left-0 right-0 flex justify-center pointer-events-none">
              <span className="text-[10px] text-white/40 bg-black/30 px-2 py-0.5 tracking-wider sm:hidden">drag to magnify</span>
              <span className="text-[10px] text-white/40 bg-black/30 px-2 py-0.5 tracking-wider hidden sm:inline">hover to magnify</span>
            </div>
          )}

          {hasPrev && (
            <button
              onClick={goPrev}
              onPointerEnter={() => setLens(null)} onPointerMove={e => e.stopPropagation()}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/55 hover:bg-black/80 text-white flex items-center justify-center transition-colors z-30 touch-manipulation"
              style={{ cursor: 'pointer' }}
              aria-label="Previous photo"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {hasNext && (
            <button
              onClick={goNext}
              onPointerEnter={() => setLens(null)} onPointerMove={e => e.stopPropagation()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/55 hover:bg-black/80 text-white flex items-center justify-center transition-colors z-30 touch-manipulation"
              style={{ cursor: 'pointer' }}
              aria-label="Next photo"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
          <div className="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none">
            <span className="text-xs text-white/60 bg-black/40 px-2 py-0.5">
              {idx + 1} / {photos.length}
            </span>
          </div>
        </div>

        {/* Info panel — scrollable */}
        <div className="sm:w-[38%] flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-5 sm:px-7 pt-5 sm:pt-7 pb-2">
            <p className="text-xs text-copper uppercase tracking-widest mb-2">Fine Art Print</p>
            <h2 className="font-serif text-lg sm:text-xl text-edge leading-snug mb-3">{photo.title}</h2>
            <p className="text-mist text-sm leading-relaxed mb-5">{photo.description}</p>
            <p className="text-xs text-mist mb-5">Archival pigment print. Shipping included in the US.</p>

            {/* Size */}
            <div className="mb-4">
              <p className="text-xs text-mist uppercase tracking-widest mb-2">Size</p>
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-1.5">
                {PRINT_SIZES.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setSizeIdx(i)}
                    className={`flex justify-between items-center px-3 py-2.5 text-sm transition-colors touch-manipulation ${
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
            <div className="mb-4">
              <p className="text-xs text-mist uppercase tracking-widest mb-2">Medium</p>
              <div className="flex gap-2">
                {PRINT_MEDIUMS.map(m => (
                  <button
                    key={m}
                    onClick={() => setMedium(m)}
                    className={`flex-1 py-3 text-sm border transition-colors touch-manipulation ${
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
            <div className="mb-4">
              <p className="text-xs text-mist uppercase tracking-widest mb-2">Quantity</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 border border-panel text-mist hover:border-mist hover:text-edge flex items-center justify-center transition-colors touch-manipulation">−</button>
                <span className="text-edge w-6 text-center">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="w-10 h-10 border border-panel text-mist hover:border-mist hover:text-edge flex items-center justify-center transition-colors touch-manipulation">+</button>
              </div>
            </div>
          </div>

          {/* Sticky add-to-cart footer */}
          <div className="px-5 sm:px-7 py-4 border-t border-darkroom flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <p className="text-edge">
                <span className="text-mist text-sm">Total </span>
                <span className="font-serif text-xl">${(selectedSize.price * quantity).toFixed(2)}</span>
              </p>
            </div>
            <button
              onClick={handleAdd}
              disabled={added}
              className={`w-full py-4 sm:py-3 text-sm tracking-wider uppercase transition-all touch-manipulation ${
                added
                  ? 'bg-copper/60 text-darkroom cursor-default'
                  : 'bg-copper text-darkroom hover:bg-amber-600 active:bg-amber-700'
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
