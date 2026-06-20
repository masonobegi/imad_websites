import fs from 'fs'
import path from 'path'
import { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { GetServerSideProps } from 'next'
import Layout from '../../components/Layout'

interface Work {
  id: string
  filename: string
  title: string
  originalSize: string | null
  available: boolean
  description: string
}

interface Props {
  category: string
  categoryLabel: string
  categoryDescription: string
  works: Work[]
}

function WorkModal({
  works,
  initialIndex,
  onClose,
  category,
  categoryLabel,
}: {
  works: Work[]
  initialIndex: number
  onClose: () => void
  category: string
  categoryLabel: string
}) {
  const [idx, setIdx] = useState(initialIndex)
  const [zoomed, setZoomed] = useState(false)
  const [dragging, setDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const containerSize = useRef({ w: 0, h: 0 })
  const zoomOrigin = useRef({ x: 0.5, y: 0.5 })
  const dragRef = useRef({ active: false, moved: false, startX: 0, startY: 0, scrollLeft: 0, scrollTop: 0 })
  const nativeScrolled = useRef(false)
  const work = works[idx]
  const hasPrev = idx > 0
  const hasNext = idx < works.length - 1

  const goPrev = useCallback(() => {
    if (hasPrev) { setIdx(i => i - 1); setZoomed(false) }
  }, [hasPrev])
  const goNext = useCallback(() => {
    if (hasNext) { setIdx(i => i + 1); setZoomed(false) }
  }, [hasNext])

  useLayoutEffect(() => {
    if (!zoomed || !containerRef.current) return
    const c = containerRef.current
    nativeScrolled.current = false
    c.scrollLeft = Math.max(0, c.scrollWidth  * zoomOrigin.current.x - c.clientWidth  / 2)
    c.scrollTop  = Math.max(0, c.scrollHeight * zoomOrigin.current.y - c.clientHeight / 2)
  }, [zoomed])

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

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 z-20 text-mist hover:text-edge transition-colors p-1"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image area — click to zoom at position, drag/scroll to pan */}
        <div
          ref={containerRef}
          className={`sm:w-[62%] flex-shrink-0 bg-darkroom relative select-none
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
            <div style={{ width: containerSize.current.w * 2, height: containerSize.current.h * 2, flexShrink: 0 }}>
              <img
                src={`/fine-art/${category}/${work.filename}`}
                alt={work.title}
                className="w-full h-full object-contain block select-none"
                draggable={false}
              />
            </div>
          ) : (
            <img
              src={`/fine-art/${category}/${work.filename}`}
              alt={work.title}
              className="w-full h-full object-contain block select-none"
              draggable={false}
            />
          )}

          {/* Zoom hint */}
          {!zoomed && (
            <div className="absolute bottom-10 left-0 right-0 flex justify-center pointer-events-none">
              <span className="text-[10px] text-white/40 bg-black/30 px-2 py-0.5 tracking-wider">click to zoom</span>
            </div>
          )}

          {!zoomed && (
            <>
              {hasPrev && (
                <button
                  onClick={e => { e.stopPropagation(); goPrev() }}
                  onPointerDown={e => e.stopPropagation()}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/55 hover:bg-black/80 text-white flex items-center justify-center transition-colors z-10 touch-manipulation"
                  aria-label="Previous"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              {hasNext && (
                <button
                  onClick={e => { e.stopPropagation(); goNext() }}
                  onPointerDown={e => e.stopPropagation()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/55 hover:bg-black/80 text-white flex items-center justify-center transition-colors z-10 touch-manipulation"
                  aria-label="Next"
                >
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
            </>
          )}
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

export default function FineArtCategory({ category, categoryLabel, categoryDescription, works }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [filter, setFilter] = useState<'all' | 'available'>('all')

  const availableCount = works.filter(w => w.available).length
  const displayed = filter === 'available' ? works.filter(w => w.available) : works

  return (
    <Layout>
      <Head>
        <title>{categoryLabel} | Fine Art | OBGillustrator.com</title>
        <meta name="description" content={categoryDescription} />
        <meta property="og:title" content={`${categoryLabel} by Imad Obegi`} />
        <meta property="og:description" content={categoryDescription} />
        {works[0] && <meta property="og:image" content={`/fine-art/${category}/${works[0].filename}`} />}
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-16">
        <div className="mb-6">
          <p className="text-xs text-mist mb-3">
            <Link href="/fine-art" className="hover:text-copper transition-colors">Fine Art</Link>
            <span className="mx-2 opacity-40">›</span>
            {categoryLabel}
          </p>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl text-ink">{categoryLabel}</h1>
              <p className="text-mist text-sm mt-1 max-w-md">{categoryDescription}</p>
            </div>
            {availableCount > 0 && (
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => setFilter('all')}
                  className={`text-xs px-3 py-1.5 border transition-colors ${filter === 'all' ? 'border-copper text-copper' : 'border-edge text-mist hover:border-shadow'}`}
                >
                  All ({works.length})
                </button>
                <button
                  onClick={() => setFilter('available')}
                  className={`text-xs px-3 py-1.5 border transition-colors ${filter === 'available' ? 'border-copper text-copper' : 'border-edge text-mist hover:border-shadow'}`}
                >
                  Available ({availableCount})
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="photo-grid">
          {displayed.map((work) => {
            const realIndex = works.findIndex(w => w.id === work.id)
            return (
              <div key={work.id} className="photo-item">
                <button
                  onClick={() => setSelectedIndex(realIndex)}
                  className="group block w-full text-left focus:outline-none"
                >
                  <div className="relative overflow-hidden bg-edge">
                    <img
                      src={`/fine-art/${category}/${work.filename}`}
                      alt={work.title}
                      className="w-full block transition-transform duration-500 group-hover:scale-[1.03] select-none"
                      draggable={false}
                      loading="lazy"
                    />
                    {work.available && (
                      <div className="absolute top-2 left-2">
                        <span className="text-[10px] bg-copper text-darkroom px-1.5 py-0.5 uppercase tracking-wider font-medium">
                          Available
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/45 transition-colors duration-300 flex items-end">
                      <div className="p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <p className="text-white text-sm font-medium leading-snug">{work.title}</p>
                        {work.originalSize && (
                          <p className="text-white/60 text-xs mt-0.5">{work.originalSize} original</p>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {selectedIndex !== null && (
        <WorkModal
          works={works}
          initialIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          category={category}
          categoryLabel={categoryLabel}
        />
      )}
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const category = params?.category as string
  const dataPath = path.join(process.cwd(), 'public', 'fine-art', 'data.json')
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
  const cat = data.categories[category]
  if (!cat) return { notFound: true }
  return {
    props: {
      category,
      categoryLabel: cat.label,
      categoryDescription: cat.description,
      works: data.works[category] || [],
    },
  }
}
