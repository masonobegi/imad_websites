import Head from 'next/head'
import type { AppProps } from 'next/app'
import { CartProvider } from '../components/CartContext'
import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <CartProvider>
      <Head>
        {/* Site-wide defaults — individual pages override these */}
        <title>Imad | OBGillustrator.com</title>
        <meta name="description" content="Fine art photography prints by Imad Obegi. Nature, San Francisco Bay, and beyond — printed on archival metal or canvas, made to order." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Open Graph */}
        <meta property="og:site_name" content="OBGillustrator.com" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Imad | OBGillustrator.com" />
        <meta property="og:description" content="Fine art photography prints by Imad Obegi. Nature, San Francisco Bay, and beyond — printed on archival metal or canvas, made to order." />
        <meta property="og:image" content="https://obgillustrator.com/photos/nature/milky-way-over-joshua-tree.jpg" />

        {/* Twitter card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Imad | OBGillustrator.com" />
        <meta name="twitter:description" content="Fine art photography prints — nature, the San Francisco Bay, and beyond." />
        <meta name="twitter:image" content="https://obgillustrator.com/photos/nature/milky-way-over-joshua-tree.jpg" />

        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </Head>
      <Component {...pageProps} />
    </CartProvider>
  )
}
