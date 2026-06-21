import Head from 'next/head'
import Link from 'next/link'
import Layout from '../components/Layout'

export default function NotFound() {
  return (
    <Layout>
      <Head><title>Page Not Found | OBGillustrator.com</title></Head>
      <div className="max-w-lg mx-auto px-6 py-32 text-center">
        <p className="text-xs text-copper uppercase tracking-widest mb-6">404</p>
        <h1 className="font-serif text-4xl text-ink mb-4">Page Not Found</h1>
        <p className="text-mist leading-relaxed mb-10">
          This page doesn&apos;t exist or may have moved.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/" className="border border-ink text-ink px-8 py-3 text-sm tracking-wider uppercase hover:bg-ink hover:text-canvas transition-colors">
            Home
          </Link>
          <Link href="/shop" className="border border-copper text-copper px-8 py-3 text-sm tracking-wider uppercase hover:bg-copper hover:text-darkroom transition-colors">
            Shop Prints
          </Link>
        </div>
      </div>
    </Layout>
  )
}
