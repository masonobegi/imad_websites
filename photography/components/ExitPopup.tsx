import { useEffect } from 'react'

interface ExitPopupProps {
  url: string
  label?: string
  onClose: () => void
}

export default function ExitPopup({ url, label, onClose }: ExitPopupProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const hostname = (() => { try { return new URL(url).hostname } catch { return url } })()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 bg-canvas border border-edge max-w-sm w-full mx-4 p-8 text-center">
        <p className="text-[10px] text-copper uppercase tracking-widest mb-3">Leaving OBGillustrator.com</p>
        <p className="font-serif text-xl text-ink mb-2">{label || 'External Link'}</p>
        <p className="text-mist text-sm mb-6 leading-relaxed">
          You&apos;re about to visit <span className="text-ink font-medium">{hostname}</span>.<br />
          Use your browser&apos;s back button to return here.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm border border-edge text-mist hover:border-shadow hover:text-ink transition-colors"
          >
            Stay here
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="px-5 py-2.5 text-sm bg-copper text-darkroom hover:bg-amber-600 transition-colors"
          >
            Continue →
          </a>
        </div>
      </div>
    </div>
  )
}
