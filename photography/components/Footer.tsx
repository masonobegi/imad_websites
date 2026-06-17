interface FooterProps { dark?: boolean }

export default function Footer({ dark = false }: FooterProps) {
  const border = dark ? 'border-panel' : 'border-edge'
  const text   = dark ? 'text-mist'   : 'text-copper'
  const hover  = dark ? 'hover:text-copper' : 'hover:text-shadow'

  return (
    <footer className={`border-t ${border} mt-16`}>
      <div className="max-w-6xl mx-auto px-6 py-8 text-center">
        <p className={`text-xs ${text} mb-3`}>
          © {new Date().getFullYear()} Imad · Fine Art Photography Prints
        </p>
        <div className={`flex justify-center gap-6 text-xs ${text}`}>
          <a href={process.env.NEXT_PUBLIC_FINEART_URL || '#'} className={`${hover} transition-colors`}>
            Fine Art
          </a>
          <span>·</span>
          <a href={process.env.NEXT_PUBLIC_STICKERS_URL || '#'} className={`${hover} transition-colors`}>
            AI Stickers
          </a>
        </div>
      </div>
    </footer>
  )
}
