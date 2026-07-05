import Head from 'next/head'
import Script from 'next/script'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import type { AppProps } from 'next/app'
import { CartProvider } from '../components/CartContext'
import '../styles/globals.css'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()

  useEffect(() => {
    const track = (url: string) => {
      const path = url.split('?')[0]
      if (path.startsWith('/admin')) return
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path }),
      }).catch(() => {})
    }
    track(router.asPath)
    router.events.on('routeChangeComplete', track)
    return () => router.events.off('routeChangeComplete', track)
  }, [router])

  return (
    <CartProvider>
      {GA_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}</Script>
        </>
      )}
      <Head>
        {/* Site-wide defaults — individual pages override these */}
        <title>Imad Obegi | OBGillustrator.com</title>
        <meta name="description" content="Fine art photography prints by Imad Obegi. Nature, San Francisco Bay, and beyond — printed on archival metal or canvas, made to order." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Open Graph */}
        <meta property="og:site_name" content="OBGillustrator.com" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Imad Obegi | OBGillustrator.com" />
        <meta property="og:description" content="Fine art photography prints by Imad Obegi. Nature, San Francisco Bay, and beyond — printed on archival metal or canvas, made to order." />
        <meta property="og:image" content="https://obgillustrator.com/photos/nature/milky-way-over-joshua-tree.jpg" />

        {/* Twitter card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Imad Obegi | OBGillustrator.com" />
        <meta name="twitter:description" content="Fine art photography prints — nature, the San Francisco Bay, and beyond." />
        <meta name="twitter:image" content="https://obgillustrator.com/photos/nature/milky-way-over-joshua-tree.jpg" />

        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </Head>
      <Component {...pageProps} />
    </CartProvider>
  )
}
