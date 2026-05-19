export default function Footer() {
  return (
    <footer className="border-t border-edge mt-20">
      <div className="max-w-5xl mx-auto px-6 py-8 text-center">
        <p className="text-xs text-copper mb-3">
          © {new Date().getFullYear()} Imad · Photography &amp; Fine Art Prints
        </p>
        <div className="flex justify-center gap-6 text-xs text-copper">
          <a
            href={process.env.NEXT_PUBLIC_FINEART_URL || '#'}
            className="hover:text-darkroom transition-colors"
          >
            Fine Art
          </a>
          <span>·</span>
          <a
            href={process.env.NEXT_PUBLIC_STICKERS_URL || '#'}
            className="hover:text-darkroom transition-colors"
          >
            AI Stickers
          </a>
        </div>
      </div>
    </footer>
  )
}
