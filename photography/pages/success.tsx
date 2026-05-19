import { useEffect } from 'react'
import Link from 'next/link'
import Layout from '../components/Layout'
import { useCart } from '../components/CartContext'

export default function Success() {
  const { clearCart } = useCart()

  useEffect(() => {
    clearCart()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Layout>
      <div className="max-w-xl mx-auto px-6 py-24 text-center">
        <div className="text-6xl mb-6">📷</div>
        <h1 className="font-serif text-4xl text-ink mb-4">Order Received</h1>
        <p className="text-copper leading-relaxed mb-3">
          Your print order is in. A confirmation email is on its way to you.
        </p>
        <p className="text-copper leading-relaxed mb-8">
          All prints are made to order and ship flat within 1–2 weeks.
          Imad will be in touch if there are any questions about your order.
        </p>
        <Link
          href="/shop"
          className="inline-block border border-darkroom text-darkroom px-10 py-3 text-sm tracking-wider uppercase hover:bg-darkroom hover:text-canvas transition-colors"
        >
          Back to Prints
        </Link>
      </div>
    </Layout>
  )
}
