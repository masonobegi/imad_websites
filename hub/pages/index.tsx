const FINE_ART_URL    = process.env.NEXT_PUBLIC_FINEART_URL    || 'http://localhost:3000'
const PHOTOGRAPHY_URL = process.env.NEXT_PUBLIC_PHOTOGRAPHY_URL || 'http://localhost:3001'
const STICKERS_URL    = process.env.NEXT_PUBLIC_STICKERS_URL    || 'http://localhost:3002'

const mediums = [
  {
    label:       'Fine Art',
    sub:         'Oil & Encaustic Paintings',
    emoji:       '🎨',
    bg:          '#8B451322',
    border:      '#8B451344',
    linkColor:   '#8B4513',
    hoverColor:  '#A0522D',
    description: 'Original paintings in oil and encaustic wax. Each piece starts from a blank canvas and is painted slowly — landscapes, seasons, and the way natural light moves through a place.',
    cta:         'View Paintings',
    href:        FINE_ART_URL,
  },
  {
    label:       'Photography',
    sub:         'Fine Art Prints',
    emoji:       '📷',
    bg:          '#4A372822',
    border:      '#4A372844',
    linkColor:   '#4A3728',
    hoverColor:  '#C17F52',
    description: 'Archival photography prints on heavyweight matte paper. Landscapes, nature, and the occasional city scene — shot when the light is worth standing in.',
    cta:         'View Prints',
    href:        PHOTOGRAPHY_URL,
  },
  {
    label:       'AI Stickers',
    sub:         'Vinyl Sticker Packs',
    emoji:       '✨',
    bg:          '#CC5A0022',
    border:      '#CC5A0044',
    linkColor:   '#CC5A00',
    hoverColor:  '#B04D00',
    description: 'Themed sticker packs made with AI illustration tools — curated, refined, and printed on waterproof vinyl. Six stickers per pack, each set its own world.',
    cta:         'Browse Packs',
    href:        STICKERS_URL,
  },
]

export default function Hub() {
  return (
    <div className="min-h-screen bg-cream flex flex-col">

      {/* Header */}
      <header className="pt-20 pb-14 px-6 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-muted mb-4">Artist</p>
        <h1 className="font-serif text-6xl md:text-7xl text-ink leading-none mb-5">
          Imad
        </h1>
        <p className="text-muted text-sm tracking-wide max-w-xs mx-auto leading-relaxed">
          Painter. Photographer. Maker of things.<br />
          Three separate shops, one person behind all of it.
        </p>
      </header>

      {/* Rule */}
      <div className="max-w-2xl mx-auto w-full px-6">
        <div className="border-t border-rule" />
      </div>

      {/* Three mediums */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-6">

        {mediums.map((m, i) => (
          <div key={m.label}>
            <section className="py-14 flex flex-col sm:flex-row sm:items-start gap-8">

              {/* Placeholder icon */}
              <div
                className="flex-shrink-0 w-20 h-20 rounded-sm flex items-center justify-center text-3xl"
                style={{ backgroundColor: m.bg, border: `1px solid ${m.border}` }}
              >
                {m.emoji}
              </div>

              {/* Text */}
              <div className="flex-1">
                <p
                  className="text-xs uppercase tracking-[0.25em] font-medium mb-1"
                  style={{ color: m.linkColor }}
                >
                  {m.sub}
                </p>
                <h2 className="font-serif text-3xl text-ink mb-3">{m.label}</h2>
                <p className="text-muted text-sm leading-relaxed mb-5 max-w-md">
                  {m.description}
                </p>
                <a
                  href={m.href}
                  className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
                  style={{ color: m.linkColor }}
                  onMouseEnter={e => (e.currentTarget.style.color = m.hoverColor)}
                  onMouseLeave={e => (e.currentTarget.style.color = m.linkColor)}
                >
                  {m.cta}
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>

            </section>

            {/* Rule between sections, not after last */}
            {i < mediums.length - 1 && (
              <div className="border-t border-rule" />
            )}
          </div>
        ))}

      </main>

      {/* Footer */}
      <footer className="border-t border-rule mt-4">
        <div className="max-w-2xl mx-auto px-6 py-8 text-center">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} Imad · All work original
          </p>
        </div>
      </footer>

    </div>
  )
}
