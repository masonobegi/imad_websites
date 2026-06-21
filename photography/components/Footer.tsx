import Link from 'next/link'

interface FooterProps { dark?: boolean }

const SECTIONS = [
  { href: '/shop',        label: 'Photography',  sub: 'Fine art prints' },
  { href: '/fine-art',   label: 'Fine Art',      sub: 'Watercolors & encaustics' },
  { href: '/stickers',   label: 'Stickers',   sub: 'via Sticker Mule' },
]

export default function Footer({ dark = false }: FooterProps) {
  const border   = dark ? 'border-panel' : 'border-edge'
  const cardBg   = dark ? 'bg-darkroom border-panel hover:border-mist' : 'bg-canvas border-edge hover:border-shadow'
  const titleCls = dark ? 'text-edge'   : 'text-ink'
  const subCls   = dark ? 'text-mist'   : 'text-mist'
  const copy     = dark ? 'text-mist'   : 'text-copper'
  const commCls  = dark
    ? 'border border-copper text-copper hover:bg-copper hover:text-darkroom'
    : 'border border-copper text-copper hover:bg-copper hover:text-darkroom'

  return (
    <footer className={`border-t ${border} mt-16`}>
      {/* Section buttons */}
      <div className="max-w-6xl mx-auto px-5 pt-10 pb-6">
        <p className={`text-xs ${copy} uppercase tracking-widest text-center mb-5`}>Explore</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SECTIONS.map(s => (
            <Link
              key={s.href}
              href={s.href}
              className={`group border ${cardBg} px-5 py-4 flex items-center justify-between transition-colors`}
            >
              <div>
                <p className={`font-medium text-sm ${titleCls}`}>{s.label}</p>
                <p className={`text-xs ${subCls} mt-0.5`}>{s.sub}</p>
              </div>
              <svg className={`w-4 h-4 ${subCls} group-hover:text-copper transition-colors flex-shrink-0 ml-4`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>

        {/* Commission CTA */}
        <div className="mt-4">
          <Link
            href="/commissions"
            className={`block w-full text-center py-3.5 text-sm tracking-wider uppercase ${commCls} transition-colors`}
          >
            Commission a Custom Piece
          </Link>
        </div>
      </div>

      {/* Copyright */}
      <div className={`border-t ${border} py-5 text-center`}>
        <p className={`text-xs ${copy}`}>© {new Date().getFullYear()} Imad &nbsp;·&nbsp; OBGillustrator.com</p>
      </div>
    </footer>
  )
}
