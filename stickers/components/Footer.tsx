export default function Footer() {
  return (
    <footer className="border-t border-peach mt-20">
      <div className="max-w-5xl mx-auto px-6 py-8 text-center">
        <p className="text-xs text-amber mb-3">
          © {new Date().getFullYear()} Imad · AI-Generated Sticker Packs
        </p>
        <div className="flex justify-center gap-6 text-xs text-amber">
          <a
            href={process.env.NEXT_PUBLIC_FINEART_URL || '#'}
            className="hover:text-ember transition-colors"
          >
            Fine Art
          </a>
          <span>·</span>
          <a
            href={process.env.NEXT_PUBLIC_PHOTOGRAPHY_URL || '#'}
            className="hover:text-ember transition-colors"
          >
            Photography
          </a>
        </div>
      </div>
    </footer>
  )
}
