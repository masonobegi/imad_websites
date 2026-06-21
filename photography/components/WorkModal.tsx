import { useState, useEffect, useCallback } from 'react'

export interface Work {
  id: string
  filename: string
  title: string
  originalSize: string | null
  available: boolean
  description: string
}

interface Props {
  works: Work[]
  initialIndex: number
  category: string
  categoryLabel: string
  onClose: () => void
}

const LENS = 170
const ZOOM = 2.8

interface LensState { x: number; y: number; cw: number; ch: number }

export default function WorkModal({ works, initialIndex, category, categoryLabel, onClose }: Props) {
  const [idx, setIdx] = useState(initialIndex)
  const [lens, setLens] = useState<LensState | null>(null)
  const work = works[idx]
  const hasPrev = idx > 0
  const hasNext = idx < works.length - 1

  const goPrev = useCallback(() => { if (hasPrev) { setIdx(i => i - 1); setLens(null) } }, [hasPrev])
  const goNext = useCallback(() => { if (hasNext) { setIdx(i => i + 1); setLens(null) } }, [hasNext])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
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
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, goPrev, goNext])

  const imgSrc = `/fine-art/${category}/${work.filename}`

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-black/85" onClick={onClose} />

      <div className="relative z-10 w-full sm:max-w-5xl sm:mx-4 bg-panel shadow-2xl flex flex-col sm:flex-row h-[92vh] sm:h-auto sm:max-h-[90vh] rounded-t-2xl sm:rounded-none">

        <button onClick={onClose}
          className="absolute top-3 right-4 z-20 text-mist hover:text-edge transition-colors p-1" aria-label="Close">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image area */}
        <div
          className="sm:w-[62%] flex-shrink-0 bg-darkroom relative select-none h-[42vh] sm:h-auto sm:max-h-[90vh] overflow-hidden flex items-center justify-center"
          style={{ cursor: lens ? 'none' : 'crosshair' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setLens(null)}
        >
          <img src={imgSrc} alt={work.title}
            className="w-full h-full object-contain block select-none" draggable={false} />

          {/* Magnifier lens (desktop hover) */}
          {lens && (
            <div
              className="absolute pointer-events-none z-20 border-2 border-white/70 shadow-[0_0_0_1px_rgba(0,0,0,0.15),0_4px_24px_rgba(0,0,0,0.55)]"
              style={{
                width: LENS, height: LENS, borderRadius: '50%',
                left: lens.x - LENS / 2, top: lens.y - LENS / 2,
                overflow: 'hidden',
              }}
            >
              <img src={imgSrc} alt="" draggable={false} className="absolute select-none"
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
            <div className="absolute bottom-10 left-0 right-0 hidden sm:flex justify-center pointer-events-none">
              <span className="text-[10px] text-white/40 bg-black/30 px-2 py-0.5 tracking-wider">hover to magnify</span>
            </div>
          )}

          {hasPrev && (
            <button onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/55 hover:bg-black/80 text-white flex items-center justify-center transition-colors z-10 touch-manipulation"
              aria-label="Previous">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {hasNext && (
            <button onClick={goNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/55 hover:bg-black/80 text-white flex items-center justify-center transition-colors z-10 touch-manipulation"
              aria-label="Next">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
          <div className="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none">
            <span className="text-xs text-white/60 bg-black/40 px-2 py-0.5">
              {idx + 1} / {works.length}
            </span>
          </div>
        </div>

        {/* Info panel */}
        <div className="sm:w-[38%] flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-5 sm:px-7 pt-5 sm:pt-7 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-xs text-copper uppercase tracking-widest">{categoryLabel}</p>
              {work.available && (
                <span className="text-[10px] bg-copper text-darkroom px-1.5 py-0.5 uppercase tracking-wider font-medium">
                  Available
                </span>
              )}
            </div>
            <h2 className="font-serif text-lg sm:text-2xl text-edge leading-snug mb-4">{work.title}</h2>
            <p className="text-mist text-sm leading-relaxed mb-6">{work.description}</p>

            <div className="space-y-3 pt-4 border-t border-darkroom text-sm">
              {work.originalSize && (
                <div className="flex justify-between text-mist">
                  <span>Original size</span>
                  <span>{work.originalSize}</span>
                </div>
              )}
              <div className="flex justify-between text-mist">
                <span>Price</span>
                <span>{work.available ? 'Inquire for price' : 'Not for sale'}</span>
              </div>
            </div>
          </div>

          <div className="px-5 sm:px-7 py-4 border-t border-darkroom flex-shrink-0">
            {work.available ? (
              <a
                href={`mailto:imadobegi@gmail.com?subject=Inquiry: ${encodeURIComponent(work.title)}&body=Hi Imad,%0A%0AI'm interested in "${work.title}". Could you share more details on availability and pricing?%0A%0AThank you`}
                className="block text-center bg-copper text-darkroom py-4 sm:py-3 text-sm tracking-wider uppercase hover:bg-amber-600 transition-colors"
              >
                Inquire about this piece
              </a>
            ) : (
              <a
                href={`mailto:imadobegi@gmail.com?subject=Question about: ${encodeURIComponent(work.title)}&body=Hi Imad,%0A%0AI admired "${work.title}" on your site. I'd love to learn more about your work.%0A%0AThank you`}
                className="block text-center border border-mist text-mist py-4 sm:py-3 text-sm tracking-wider uppercase hover:border-edge hover:text-edge transition-colors"
              >
                Ask about this work
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
