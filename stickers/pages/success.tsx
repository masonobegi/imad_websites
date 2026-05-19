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
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-4xl font-bold text-ink mb-4">Order Received!</h1>
        <p className="text-amber leading-relaxed mb-3">
          Your sticker packs are on the way. Check your email for a confirmation.
        </p>
        <p className="text-amber leading-relaxed mb-8">
          All orders ship in a rigid mailer to keep everything flat and protected.
          Allow 5–7 business days.
        </p>
        <Link
          href="/shop"
          className="inline-block bg-ember text-canvas px-10 py-3 text-sm font-semibold tracking-wide rounded-lg hover:bg-rust transition-colors"
        >
          Back to Shop
        </Link>
      </div>
    </Layout>
  )
}
