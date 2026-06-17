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
        <p className="text-mist leading-relaxed mb-3 max-w-sm mx-auto">
          Imad's AI sticker packs — original character designs as singles and sets — will be available here soon.
        </p>
        <p className="text-mist text-sm leading-relaxed mb-10 max-w-sm mx-auto">
          In the meantime, explore the photography collection or check back soon.
        </p>
        <Link href="/" className="inline-block border border-ink text-ink px-8 py-3 text-sm tracking-wider uppercase hover:bg-ink hover:text-canvas transition-colors">
          ← Back
        </Link>
      </div>
    </Layout>
  )
}
