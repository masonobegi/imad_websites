import { useState, useEffect, useCallback } from 'react'

export interface PleinAirImage {
  id: string
  filename: string
  title: string
}

export interface OilWork {
  id: string
  filename: string
  title: string
  originalSize: string | null
  available: boolean
  originalPrice: number | null
  reprintAvailable: boolean
  reprintPrice: number | null
  description: string
  award: { title: string; url: string } | null
  pleinAirImages: PleinAirImage[]
}

interface Props {
  works: OilWork[]
  initialIndex: number
  onClose: () => void
}

const LENS = 170
const ZOOM = 2.8

interface LensState { x: number; y: number; cw: number; ch: number; isTouch: boolean }

function MagnifierImage({
  src,
  alt,
}: {
  src: string
  alt: string
}) {
  const [lens, setLens] = useState<LensState | null>(null)

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    setLens({
      x: e.clientX - r.left,
      y: e.clientY - r.top,
      cw: e.currentTarget.offsetWidth,
      ch: e.currentTarget.offsetHeight,
      isTouch: e.pointerType === 'touch',
    })
  }

  return (
    <div
      className="w-full h-full relative select-none touch-none"
      onPointerMove={handlePointerMove}
      onPointerLeave={(e) => { if (e.pointerType !== 'touch') setLens(null) }}
      onPointerUp={(e) => { if (e.pointerType !== 'touch') setLens(null) }}
      style={{ cursor: lens ? 'none' : 'crosshair' }}
    >
      <img src={src} alt={alt} className="w-full h-full object-contain block select-none" draggable={false} />

      {lens && (
        <div
          className="absolute pointer-events-none z-20 border-2 border-white/70 shadow-[0_0_0_1px_rgba(0,0,0,0.15),0_4px_24px_rgba(0,0,0,0.55)]"
          style={{
            width: LENS, height: LENS, borderRadius: '50%',
            left: lens.x - LENS / 2 - (lens.isTouch ? 120 : 0),
            top: lens.y - LENS / 2 - (lens.isTouch ? 120 : 0),
            overflow: 'hidden',
          }}
        >
          <img
            src={src}
            alt=""
            draggable={false}
            className="absolute select-none"
            style={{
              width: lens.cw * ZOOM,
              height: lens.ch * ZOOM,
              objectFit: 'contain',
              left: LENS / 2 - lens.x * ZOOM,
              top: LENS / 2 - lens.y * ZOOM,
              maxWidth: 'none',
              maxHeight: 'none',
            }}
          />
        </div>
      )}

      {!lens && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center pointer-events-none">
          <span className="text-[10px] text-white/40 bg-black/30 px-2 py-0.5 tracking-wider sm:hidden">drag to magnify</span>
          <span className="text-[10px] text-white/40 bg-black/30 px-2 py-0.5 tracking-wider hidden sm:inline">hover to magnify</span>
        </div>
      )}
    </div>
  )
}

export default function OilModal({ works, initialIndex, onClose }: Props) {
  const [idx, setIdx] = useState(initialIndex)
  const [subIdx, setSubIdx] = useState<number | null>(null)
  const work = works[idx]
  const hasPrev = idx > 0
  const hasNext = idx < works.length - 1

  const activeSrc = subIdx !== null
    ? `/fine-art/oils/plein-air/${work.pleinAirImages[subIdx].filename}`
    : `/fine-art/oils/${work.filename}`
  const activeAlt = subIdx !== null ? work.pleinAirImages[subIdx].title : work.title

  const goPrev = useCallback(() => {
    if (hasPrev) { setIdx(i => i - 1); setSubIdx(null) }
  }, [hasPrev])
  const goNext = useCallback(() => {
    if (hasNext) { setIdx(i => i + 1); setSubIdx(null) }
  }, [hasNext])

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
        <div className="sm:w-[62%] flex-shrink-0 bg-darkroom relative h-[42vh] sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col">
          {/* Main image */}
          <div className="flex-1 flex items-center justify-center min-h-0">
            <MagnifierImage src={activeSrc} alt={activeAlt} />
          </div>

          {/* Plein air thumbnails strip */}
          {work.pleinAirImages.length > 0 && (
            <div className="flex gap-1 p-2 bg-black/40 flex-shrink-0">
              {/* Main painting thumb */}
              <button
                onClick={() => setSubIdx(null)}
                className={`w-14 h-14 overflow-hidden flex-shrink-0 border-2 transition-colors ${subIdx === null ? 'border-copper' : 'border-transparent hover:border-white/40'}`}
              >
                <img src={`/fine-art/oils/${work.filename}`} alt={work.title}
                  className="w-full h-full object-cover" draggable={false} />
              </button>
              {work.pleinAirImages.map((pi, i) => (
                <button
                  key={pi.id}
                  onClick={() => setSubIdx(i)}
                  title={pi.title}
                  className={`w-14 h-14 overflow-hidden flex-shrink-0 border-2 transition-colors ${subIdx === i ? 'border-copper' : 'border-transparent hover:border-white/40'}`}
                >
                  <img src={`/fine-art/oils/plein-air/${pi.filename}`} alt={pi.title}
                    className="w-full h-full object-cover" draggable={false} />
                </button>
              ))}
            </div>
          )}

          {/* Prev/next */}
          {hasPrev && (
            <button onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/55 hover:bg-black/80 text-white flex items-center justify-center transition-colors z-30 touch-manipulation"
              style={{ cursor: 'pointer' }}
              aria-label="Previous">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {hasNext && (
            <button onClick={goNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/55 hover:bg-black/80 text-white flex items-center justify-center transition-colors z-30 touch-manipulation"
              style={{ cursor: 'pointer' }}
              aria-label="Next">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
          <div className="absolute bottom-[70px] left-0 right-0 flex justify-center pointer-events-none">
            {work.pleinAirImages.length > 0 && (
              <span className="text-[10px] text-white/50 bg-black/40 px-2 py-0.5">
                {subIdx === null ? work.title : work.pleinAirImages[subIdx].title}
              </span>
            )}
          </div>
        </div>

        {/* Info panel */}
        <div className="sm:w-[38%] flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-5 sm:px-7 pt-5 sm:pt-7 pb-4">
            <p className="text-xs text-copper uppercase tracking-widest mb-2">Oil Painting</p>

            {/* Award badge */}
            {work.award && (
              <a
                href={work.award.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 mb-3 bg-copper/10 border border-copper/30 px-3 py-2 hover:bg-copper/20 transition-colors group"
              >
                <svg className="w-4 h-4 text-copper flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="text-xs text-copper leading-snug">{work.award.title}</span>
                <svg className="w-3 h-3 text-copper/60 ml-auto flex-shrink-0 group-hover:text-copper transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}

            <h2 className="font-serif text-lg sm:text-2xl text-edge leading-snug mb-4">{work.title}</h2>
            <p className="text-mist text-sm leading-relaxed mb-6">{work.description}</p>

            <div className="space-y-0 border border-edge text-sm overflow-hidden">
              {/* Original */}
              <div className="px-4 py-3 border-b border-edge">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-mist uppercase tracking-wider mb-0.5">Original</p>
                    {work.available ? (
                      <p className="text-edge font-medium">${work.originalPrice?.toLocaleString()}</p>
                    ) : (
                      <p className="text-mist">Not available</p>
                    )}
                    {work.originalSize && <p className="text-xs text-mist mt-0.5">{work.originalSize} · Oil on panel</p>}
                  </div>
                  {work.available && (
                    <a
                      href={`mailto:imadobegi@gmail.com?subject=Original Oil Inquiry: ${encodeURIComponent(work.title)}&body=Hi Imad,%0A%0AI'm interested in the original oil painting "${work.title}" ($${work.originalPrice}). Could you let me know if it's still available?%0A%0AThank you`}
                      className="text-xs bg-copper text-darkroom px-3 py-1.5 uppercase tracking-wider hover:bg-amber-600 transition-colors flex-shrink-0"
                    >
                      Inquire
                    </a>
                  )}
                </div>
              </div>

              {/* Reprint */}
              {work.reprintAvailable && (
                <div className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-mist uppercase tracking-wider mb-0.5">Archival Reprint</p>
                      <p className="text-edge font-medium">${work.reprintPrice}</p>
                      <p className="text-xs text-mist mt-0.5">Archival watercolor paper · 11"×14"</p>
                    </div>
                    <a
                      href={`mailto:imadobegi@gmail.com?subject=Reprint Inquiry: ${encodeURIComponent(work.title)}&body=Hi Imad,%0A%0AI'm interested in an archival reprint of "${work.title}" ($${work.reprintPrice}). Could you share more details?%0A%0AThank you`}
                      className="text-xs border border-mist text-mist px-3 py-1.5 uppercase tracking-wider hover:border-edge hover:text-edge transition-colors flex-shrink-0"
                    >
                      Contact
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Plein air label */}
            {work.pleinAirImages.length > 0 && (
              <p className="text-xs text-mist mt-4 leading-relaxed">
                Thumbnails below the painting show the work in progress and the finished archival reprint.
              </p>
            )}
          </div>

          <div className="px-5 sm:px-7 py-3 border-t border-darkroom flex-shrink-0 flex items-center justify-between">
            <span className="text-xs text-mist">{idx + 1} / {works.length}</span>
            <div className="flex gap-2">
              {hasPrev && (
                <button onClick={goPrev}
                  className="text-xs border border-edge text-mist px-3 py-1.5 hover:border-shadow transition-colors touch-manipulation">
                  ← Prev
                </button>
              )}
              {hasNext && (
                <button onClick={goNext}
                  className="text-xs border border-edge text-mist px-3 py-1.5 hover:border-shadow transition-colors touch-manipulation">
                  Next →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
