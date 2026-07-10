import { useState, useEffect, useCallback } from 'react'

export interface ProcessMedia {
  id: string
  filename: string
  title: string
}

export interface Work {
  id: string
  filename: string
  title: string
  originalSize: string | null
  available: boolean
  description: string
  price: number | null
  reprintAvailable?: boolean
  reprintPrice?: number | null
  reprintMedium?: string | null
  processImages?: ProcessMedia[]
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
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const work = works[idx]
  const hasPrev = idx > 0
  const hasNext = idx < works.length - 1

  const goPrev = useCallback(() => { if (hasPrev) { setIdx(i => i - 1); setLens(null); setStatus('idle') } }, [hasPrev])
  const goNext = useCallback(() => { if (hasNext) { setIdx(i => i + 1); setLens(null); setStatus('idle') } }, [hasNext])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/send-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, message, workTitle: work.title, workType: categoryLabel, inquiryType: 'general' }),
      })
      setStatus(res.ok ? 'sent' : 'error')
    } catch {
      setStatus('error')
    }
  }

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

      <div className="relative z-10 w-full sm:max-w-5xl sm:mx-4 bg-panel shadow-2xl flex flex-col sm:flex-row h-[92vh] sm:h-auto sm:max-h-[90vh] rounded-t-2xl sm:rounded-none"
>

        <button onClick={onClose}
          className="absolute top-3 right-4 z-20 text-mist hover:text-edge transition-colors p-1" aria-label="Close">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image area */}
        <div
          className="sm:w-[62%] flex-shrink-0 bg-darkroom relative select-none touch-none h-[42vh] sm:h-auto sm:max-h-[90vh] overflow-hidden flex items-center justify-center"
          style={{ cursor: lens ? 'none' : 'crosshair' }}
          onPointerMove={handlePointerMove}
          onPointerLeave={(e) => { if (e.pointerType !== 'touch') setLens(null) }}
          onPointerUp={(e) => { if (e.pointerType !== 'touch') setLens(null) }}
        >
          <img src={imgSrc} alt={work.title}
            className="w-full h-full object-contain block select-none" draggable={false} />

          {/* Magnifier lens (desktop hover) */}
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
            <div className="absolute bottom-10 left-0 right-0 flex justify-center pointer-events-none">
              <span className="text-[10px] text-white/40 bg-black/30 px-2 py-0.5 tracking-wider sm:hidden">drag to magnify</span>
              <span className="text-[10px] text-white/40 bg-black/30 px-2 py-0.5 tracking-wider hidden sm:inline">hover to magnify</span>
            </div>
          )}

          {hasPrev && (
            <button onClick={goPrev}
              onPointerEnter={() => setLens(null)} onPointerMove={e => e.stopPropagation()}
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
              onPointerEnter={() => setLens(null)} onPointerMove={e => e.stopPropagation()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/55 hover:bg-black/80 text-white flex items-center justify-center transition-colors z-30 touch-manipulation"
              style={{ cursor: 'pointer' }}
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
                  Original available
                </span>
              )}
            </div>
            <h2 className="font-serif text-lg sm:text-2xl text-edge leading-snug mb-4">{work.title}</h2>
            <p className="text-mist text-sm leading-relaxed mb-6">{work.description}</p>

            <div className="space-y-0 border border-darkroom text-sm overflow-hidden">
              <div className={`px-4 py-3 ${work.reprintAvailable ? 'border-b border-darkroom' : ''}`}>
                <p className="text-xs text-mist uppercase tracking-wider mb-0.5">Original</p>
                {work.available ? (
                  <p className="text-edge font-medium">
                    {work.price ? `$${work.price.toLocaleString()}` : 'Inquire for price'}
                  </p>
                ) : (
                  <p className="text-mist">Not for sale</p>
                )}
                {work.originalSize && <p className="text-xs text-mist mt-0.5">{work.originalSize}</p>}
              </div>
              {work.reprintAvailable && (
                <div className="px-4 py-3">
                  <p className="text-xs text-mist uppercase tracking-wider mb-0.5">Archival Reprint</p>
                  <p className="text-edge font-medium">
                    {work.reprintPrice ? `$${work.reprintPrice.toLocaleString()}` : 'Inquire for price'}
                  </p>
                  {work.reprintMedium && <p className="text-xs text-mist mt-0.5">{work.reprintMedium}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Process images / videos */}
          {work.processImages && work.processImages.length > 0 && (
            <div className="px-5 sm:px-7 pb-4 border-t border-darkroom pt-4">
              <p className="text-xs text-mist uppercase tracking-widest mb-3">Process</p>
              <div className="grid grid-cols-3 gap-2">
                {work.processImages.map(pm => {
                  const ext = pm.filename.split('.').pop()?.toLowerCase() || ''
                  const isVideo = ['mp4', 'mov', 'webm', 'm4v'].includes(ext)
                  const src = `/fine-art/${category}/${pm.filename}`
                  return isVideo ? (
                    <video key={pm.id} src={src} controls muted playsInline
                      className="w-full aspect-square object-cover rounded" title={pm.title} />
                  ) : (
                    <img key={pm.id} src={src} alt={pm.title}
                      className="w-full aspect-square object-cover rounded" loading="lazy" />
                  )
                })}
              </div>
            </div>
          )}

          <div className="px-5 sm:px-7 py-4 border-t border-darkroom flex-shrink-0">
            {status === 'sent' ? (
              <p className="text-center text-sm text-copper py-2">Message sent — Imad will be in touch soon.</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-2">
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Your email"
                  className="w-full bg-darkroom border border-panel text-edge text-sm px-3 py-2 placeholder:text-mist focus:outline-none focus:border-mist"
                />
                <textarea
                  required value={message} onChange={e => setMessage(e.target.value)}
                  placeholder={work.available ? `Hi Imad, I'm interested in "${work.title}"…` : `Hi Imad, I admired "${work.title}" on your site…`}
                  rows={3}
                  className="w-full bg-darkroom border border-panel text-edge text-sm px-3 py-2 placeholder:text-mist focus:outline-none focus:border-mist resize-none"
                />
                {status === 'error' && <p className="text-xs text-red-400">Something went wrong — try again.</p>}
                <button
                  type="submit" disabled={status === 'sending'}
                  className="w-full py-3 text-sm tracking-wider uppercase transition-colors bg-copper text-darkroom hover:bg-amber-600 disabled:opacity-60"
                >
                  {status === 'sending' ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
