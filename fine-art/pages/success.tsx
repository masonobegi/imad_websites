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
        <div className="text-6xl mb-6">🎨</div>
        <h1 className="font-serif text-4xl text-ink mb-4">Order Received</h1>
        <p className="text-clay leading-relaxed mb-3">
          Thank you — your order has been placed. A confirmation email is on its way to you.
        </p>
        <p className="text-clay leading-relaxed mb-8">
          Imad will reach out within a couple of days with shipping details.
          Each piece ships carefully packed within 2–3 weeks.
        </p>
        <Link
          href="/shop"
          className="inline-block border border-bark text-bark px-10 py-3 text-sm tracking-wider uppercase hover:bg-bark hover:text-canvas transition-colors"
        >
          Back to Shop
        </Link>
      </div>
    </Layout>
  )
}
