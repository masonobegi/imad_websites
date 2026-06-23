import { useEffect } from 'react'
import Link from 'next/link'
import Layout from '../components/Layout'
import { useCart } from '../components/CartContext'

export default function Success() {
  const { clearCart } = useCart()

  useEffect(() => {
    clearCart()
    localStorage.removeItem('photo-cart')
  }, []) // eslint-disable-line

  return (
    <Layout>
      <div className="max-w-lg mx-auto px-6 py-24 text-center">
        <div className="w-12 h-12 border border-copper rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-5 h-5 text-copper" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-serif text-4xl text-ink mb-4">Order Received</h1>
        <p className="text-mist leading-relaxed mb-3">
          Your prints are being made. A confirmation email is on its way to you.
        </p>
        <p className="text-mist leading-relaxed mb-8">
          All prints ship flat within 1–2 weeks.
          Imad will be in touch if there are any questions about your order.
        </p>
        <Link href="/shop" className="inline-block border border-ink text-ink px-10 py-3 text-sm tracking-wider uppercase hover:bg-ink hover:text-canvas transition-colors">
          Back to Shop
        </Link>
      </div>
    </Layout>
  )
}
