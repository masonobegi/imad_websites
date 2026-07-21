import { useState, useEffect, useCallback, useRef } from 'react'
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

function parsePrintRatio(label: string): number | null {
  const m = label.match(/(\d+(?:\.\d+)?)\s*[×xX]\s*(\d+(?:\.\d+)?)/)
  if (!m) return null
  const a = parseFloat(m[1]), b = parseFloat(m[2])
  return (a && b) ? Math.max(a, b) / Math.min(a, b) : null
}

interface LensState { x: number; y: number; cw: number; ch: number }

export default function PhotoModal({ photos, initialIndex, onClose, onAddedToCart, printSizes }: PhotoModalProps) {
  const [idx, setIdx] = useState(initialIndex)
  const [sizeIdx, setSizeIdx] = useState(0)
  const [medium, setMedium] = useState<PrintMedium>('Metal')
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [lens, setLens] = useState<LensState | null>(null)
  const [photoDims, setPhotoDims] = useState<{ w: number; h: number } | null>(null)
  const [cropPreview, setCropPreview] = useState(true)
  const [wrap, setWrap] = useState<{ cw: number; ch: number } | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const { addItem } = useCart()

  const PRINT_SIZES = printSizes || DEFAULT_PRINT_SIZES
  const photo = photos[idx]
  const selectedSize = PRINT_SIZES[sizeIdx]
  const hasPrev = idx > 0
  const hasNext = idx < photos.length - 1

  const goPrev = useCallback(() => { if (hasPrev) { setIdx(i => i - 1); setAdded(false); setLens(null) } }, [hasPrev])
  const goNext = useCallback(() => { if (hasNext) { setIdx(i => i + 1); setAdded(false); setLens(null) } }, [hasNext])

  // Detect dims from cached image when photo changes; onLoad handles non-cached
  useEffect(() => {
    const img = imgRef.current
    if (img && img.complete && img.naturalWidth) {
      setPhotoDims({ w: img.naturalWidth, h: img.naturalHeight })
    } else {
      setPhotoDims(null)
    }
  }, [idx])

  // Auto-select the best-fit print size when dims are known
  useEffect(() => {
    if (!photoDims) return
    const ratio = Math.max(photoDims.w, photoDims.h) / Math.min(photoDims.w, photoDims.h)
    let bestIdx = 0
    let bestDiff = Infinity
    PRINT_SIZES.forEach((s, i) => {
      const pr = parsePrintRatio(s.label)
      if (pr === null) return
      const diff = Math.abs(ratio - pr)
      if (diff < bestDiff) { bestDiff = diff; bestIdx = i }
    })
    setSizeIdx(bestIdx)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoDims])

  function fitLabel(label: string): 'best' | 'crop' | null {
    if (!photoDims) return null
    const pr = parsePrintRatio(label)
    if (!pr) return null
    const ratio = Math.max(photoDims.w, photoDims.h) / Math.min(photoDims.w, photoDims.h)
    const diff = Math.abs(ratio - pr)
    if (diff < 0.06) return 'best'
    if (diff >= 0.25) return 'crop'
    return null
  }

  // Measure the photo container so we can map the crop rectangle onto the
  // letterboxed (object-contain) image precisely as it renders.
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const update = () => setWrap({ cw: el.clientWidth, ch: el.clientHeight })
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Crop rectangle for the selected size, in on-screen pixels within the
  // photo container. The print ratio is oriented to match the photo, then
  // centered — matching how the print would actually be cropped.
  const cropBox = (() => {
    if (!photoDims || !wrap) return null
    const pr = parsePrintRatio(selectedSize.label)
    if (!pr) return null
    const { w: pw, h: ph } = photoDims
    const { cw, ch } = wrap
    if (!cw || !ch) return null
    const photoAR = pw / ph
    const targetAR = photoAR >= 1 ? pr : 1 / pr // print aspect oriented to photo
    const scale = Math.min(cw / pw, ch / ph)
    const dispW = pw * scale, dispH = ph * scale
    const offX = (cw - dispW) / 2, offY = (ch - dispH) / 2
    let cropW: number, cropH: number
    if (photoAR > targetAR) { cropH = ph; cropW = ph * targetAR } // trim sides
    else { cropW = pw; cropH = pw / targetAR }                    // trim top/bottom
    cropW = Math.min(cropW, pw); cropH = Math.min(cropH, ph)
    const boxW = (cropW / pw) * dispW
    const boxH = (cropH / ph) * dispH
    const boxLeft = offX + (dispW - boxW) / 2
    const boxTop = offY + (dispH - boxH) / 2
    const isFull = Math.abs(cropW - pw) < 1 && Math.abs(cropH - ph) < 1
    return { boxLeft, boxTop, boxW, boxH, isFull }
  })()


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
          ref={wrapRef}
          className="sm:w-[62%] flex-shrink-0 bg-darkroom relative photo-wrapper select-none touch-none h-[42vh] sm:h-auto sm:max-h-[90vh] overflow-hidden flex items-center justify-center"
          style={{ cursor: lens ? 'none' : 'crosshair' }}
          onPointerMove={handlePointerMove}
          onPointerLeave={(e) => { if (e.pointerType !== 'touch') setLens(null) }}
          onPointerUp={(e) => { if (e.pointerType !== 'touch') setLens(null) }}
        >
          <img
            ref={imgRef}
            src={`/photos/${photo.category}/${photo.filename}?v=5`}
            alt={photo.title}
            className="w-full h-full object-contain block select-none photo-protected"
            draggable={false}
            onLoad={() => {
              const img = imgRef.current
              if (img) setPhotoDims({ w: img.naturalWidth, h: img.naturalHeight })
            }}
          />

          {/* Crop preview overlay — bright inside the print area, darkened
              outside. Shows exactly what the selected size keeps when printed. */}
          {cropPreview && cropBox && (
            <div
              className="absolute pointer-events-none z-[15]"
              style={{
                left: cropBox.boxLeft,
                top: cropBox.boxTop,
                width: cropBox.boxW,
                height: cropBox.boxH,
                boxShadow: cropBox.isFull ? 'none' : '0 0 0 9999px rgba(0,0,0,0.55)',
                outline: '1.5px solid rgba(255,255,255,0.9)',
                outlineOffset: '-1px',
              }}
            >
              <span className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 leading-none tracking-wide">
                {selectedSize.label}{cropBox.isFull ? ' · full frame' : ' crop'}
              </span>
            </div>
          )}

          {/* Crop-preview toggle */}
          <button
            onClick={() => setCropPreview(v => !v)}
            onPointerEnter={() => setLens(null)}
            onPointerMove={e => e.stopPropagation()}
            className="absolute top-3 left-3 z-40 flex items-center gap-1.5 bg-black/55 hover:bg-black/80 text-white text-[11px] px-2.5 py-1.5 tracking-wide transition-colors touch-manipulation"
            style={{ cursor: 'pointer' }}
            aria-pressed={!cropPreview}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 2v14a2 2 0 002 2h14M2 6h14a2 2 0 012 2v14" />
            </svg>
            {cropPreview ? 'No Crop' : 'Show Crop'}
          </button>

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
                src={`/photos/${photo.category}/${photo.filename}?v=5`}
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
            <p className="text-xs text-mist mb-5">High quality professionally printed. Shipping is included in the United States.</p>

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
                    <span className="flex items-center gap-2">
                      {s.label}
                      {fitLabel(s.label) === 'best' && (
                        <span className="text-[10px] text-emerald-400 font-medium leading-none">Not Cropped</span>
                      )}
                      {fitLabel(s.label) === 'crop' && (
                        <span className="text-[10px] text-amber-400 font-medium leading-none">Cropped</span>
                      )}
                    </span>
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
          <div className="px-5 sm:px-7 py-4 border-t border-panel flex-shrink-0">
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
