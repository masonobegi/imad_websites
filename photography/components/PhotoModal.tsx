import { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react'
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
  const [zoomed, setZoomed] = useState(false)
  const [dragging, setDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const containerSize = useRef({ w: 0, h: 0 })
  const zoomOrigin = useRef({ x: 0.5, y: 0.5 })
  const dragRef = useRef({ active: false, moved: false, startX: 0, startY: 0, scrollLeft: 0, scrollTop: 0 })
  const nativeScrolled = useRef(false)
  const { addItem } = useCart()

  const photo = photos[idx]
  const selectedSize = PRINT_SIZES[sizeIdx]
  const hasPrev = idx > 0
  const hasNext = idx < photos.length - 1

  const goPrev = useCallback(() => { if (hasPrev) { setIdx(i => i - 1); setAdded(false); setZoomed(false) } }, [hasPrev])
  const goNext = useCallback(() => { if (hasNext) { setIdx(i => i + 1); setAdded(false); setZoomed(false) } }, [hasNext])

  // useLayoutEffect fires after DOM is committed + layout is computed — scrollWidth/Height are reliable here
  useLayoutEffect(() => {
    if (!zoomed || !containerRef.current) return
    const c = containerRef.current
    nativeScrolled.current = false
    c.scrollLeft = Math.max(0, c.scrollWidth  * zoomOrigin.current.x - c.clientWidth  / 2)
    c.scrollTop  = Math.max(0, c.scrollHeight * zoomOrigin.current.y - c.clientHeight / 2)
  }, [zoomed])

  // Mouse-only drag pan (setPointerCapture kills native touch scroll on mobile)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!zoomed || e.pointerType !== 'mouse') return
    dragRef.current = {
      active: true, moved: false,
      startX: e.clientX, startY: e.clientY,
      scrollLeft: containerRef.current?.scrollLeft ?? 0,
      scrollTop:  containerRef.current?.scrollTop  ?? 0,
    }
    setDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active || !containerRef.current) return
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragRef.current.moved = true
    containerRef.current.scrollLeft = dragRef.current.scrollLeft - dx
    containerRef.current.scrollTop  = dragRef.current.scrollTop  - dy
  }

  const handlePointerUp = () => { dragRef.current.active = false; setDragging(false) }

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoomed) {
      // Don't zoom out if user was dragging (desktop) or scrolling (mobile)
      if (dragRef.current.moved || nativeScrolled.current) {
        dragRef.current.moved = false
        nativeScrolled.current = false
        return
      }
      setZoomed(false)
      return
    }
    const rect = e.currentTarget.getBoundingClientRect()
    containerSize.current = { w: rect.width, h: rect.height }
    zoomOrigin.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top)  / rect.height,
    }
    setZoomed(true)
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
                      rounded-t-2xl sm:rounded-none">

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

        {/* Photo area — click to zoom, drag/scroll to pan */}
        <div
          ref={containerRef}
          className={`sm:w-[62%] flex-shrink-0 bg-darkroom relative photo-wrapper select-none
            ${zoomed
              ? `overflow-auto ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`
              : 'h-[42vh] sm:h-auto sm:max-h-[90vh] overflow-hidden flex items-center justify-center cursor-zoom-in'}`}
          style={zoomed ? {
            height: containerSize.current.h,
            WebkitOverflowScrolling: 'touch',
          } as React.CSSProperties : undefined}
          onClick={handleContainerClick}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onScroll={() => { if (zoomed) nativeScrolled.current = true }}
        >
          {zoomed ? (
            // Inner div is 2× the container — this creates the actual scroll space.
            // w-[200%] on the img was unreliable because flex containers expand to fit children.
            <div style={{ width: containerSize.current.w * 2, height: containerSize.current.h * 2, flexShrink: 0 }}>
              <img
                src={`/photos/${photo.category}/${photo.filename}`}
                alt={photo.title}
                className="w-full h-full object-contain block select-none photo-protected"
                draggable={false}
              />
            </div>
          ) : (
            <img
              src={`/photos/${photo.category}/${photo.filename}`}
              alt={photo.title}
              className="w-full h-full object-contain block select-none photo-protected"
              draggable={false}
            />
          )}
          {!zoomed && (
            <div className="absolute bottom-10 left-0 right-0 flex justify-center pointer-events-none">
              <span className="text-[10px] text-white/40 bg-black/30 px-2 py-0.5 tracking-wider">click to zoom</span>
            </div>
          )}

          {/* Prev button */}
          {hasPrev && (
            <button
              onClick={e => { e.stopPropagation(); goPrev() }}
              onPointerDown={e => e.stopPropagation()}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/55 hover:bg-black/80 text-white flex items-center justify-center transition-colors z-10 touch-manipulation"
              aria-label="Previous photo"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Next button */}
          {hasNext && (
            <button
              onClick={e => { e.stopPropagation(); goNext() }}
              onPointerDown={e => e.stopPropagation()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/55 hover:bg-black/80 text-white flex items-center justify-center transition-colors z-10 touch-manipulation"
              aria-label="Next photo"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Counter */}
          <div className="absolute bottom-2 left-0 right-0 flex justify-center">
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
