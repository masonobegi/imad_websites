import Link from 'next/link'
import Layout from '../components/Layout'

export default function Stickers() {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-5 py-20 sm:py-28 text-center">
        <p className="text-xs text-copper uppercase tracking-widest mb-4">AI Stickers</p>
        <h1 className="font-serif text-4xl sm:text-5xl text-ink mb-6 leading-tight">
          Original Character<br />Designs
        </h1>
        <p className="text-mist leading-relaxed mb-10 max-w-sm mx-auto">
          Imad's original character sticker designs — available as singles and sets.
        </p>

        {/* Stickermule CTA */}
        <a
          href="https://www.stickermule.com/obgillustrator"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 border border-ink text-ink px-8 py-3 text-sm tracking-wider uppercase hover:bg-ink hover:text-canvas transition-colors"
        >
          Shop Stickers
          <svg className="h-3.5 w-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>

        <p className="text-xs text-mist mt-5 opacity-60">via Sticker Mule</p>
      </div>
    </Layout>
  )
}
