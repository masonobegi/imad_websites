export default function Footer() {
  return (
    <footer className="border-t border-linen mt-20">
      <div className="max-w-5xl mx-auto px-6 py-8 text-center">
        <p className="text-xs text-clay mb-3">
          © {new Date().getFullYear()} Imad · All works made by hand
        </p>
        <div className="flex justify-center gap-6 text-xs text-clay">
          <a
            href={process.env.NEXT_PUBLIC_PHOTOGRAPHY_URL || '#'}
            className="hover:text-bark transition-colors"
          >
            Photography
          </a>
          <span>·</span>
          <a
            href={process.env.NEXT_PUBLIC_STICKERS_URL || '#'}
            className="hover:text-bark transition-colors"
          >
            AI Stickers
          </a>
        </div>
      </div>
    </footer>
  )
}
