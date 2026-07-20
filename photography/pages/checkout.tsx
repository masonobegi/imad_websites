import { useState } from 'react'
import Layout from '../components/Layout'
import { useCart } from '../components/CartContext'

export default function Checkout() {
  const { items, total } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCheckout() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Checkout failed')
      window.location.href = data.url
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  const inputRowClass = "flex justify-between text-sm"

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="font-serif text-3xl text-ink mb-8">Checkout</h1>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-mist mb-4">Your cart is empty.</p>
            <a href="/shop" className="text-sm text-copper border-b border-copper/40 pb-0.5">Back to shop</a>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-12">

            {/* Order summary */}
            <div className="flex-1">
              <div className="bg-canvas border border-edge p-6">
                <h2 className="font-serif text-base text-ink mb-4">Order Summary</h2>
                <ul className="space-y-4 mb-6">
                  {items.map(item => (
                    <li key={item.id} className="flex gap-3">
                      <div className="w-14 h-14 bg-darkroom overflow-hidden flex-shrink-0">
                        <img
                          src={`/photos/${item.category}/${item.image}?v=3`}
                          alt={item.productName}
                          className="w-full h-full object-cover photo-protected"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-ink leading-snug">{item.productName}</p>
                        <p className="text-xs text-mist mt-0.5">{item.size} · {item.medium} · qty {item.quantity}</p>
                      </div>
                      <p className="text-sm text-ink flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</p>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-edge pt-4 space-y-2">
                  <div className={inputRowClass}>
                    <span className="text-mist">Subtotal</span>
                    <span className="text-ink">${total.toFixed(2)}</span>
                  </div>
                  <div className={inputRowClass}>
                    <span className="text-mist">Shipping</span>
                    <span className="text-ink">Included</span>
                  </div>
                  <div className="flex justify-between font-medium text-sm pt-2 border-t border-edge">
                    <span className="text-ink">Total</span>
                    <span className="text-ink">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {error && (
                  <p className="text-red-600 text-sm">{error}</p>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full bg-shadow text-canvas py-4 text-sm tracking-wider uppercase hover:bg-ink transition-colors disabled:opacity-60 disabled:cursor-wait"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Redirecting to payment…
                    </span>
                  ) : `Proceed to Payment — $${total.toFixed(2)}`}
                </button>

                <p className="text-xs text-mist text-center">
                  Secure checkout powered by Stripe. Prints ship flat within 1–2 weeks.
                </p>
              </div>
            </div>

            {/* Info sidebar */}
            <div className="md:w-72 flex-shrink-0 space-y-6">
              <div>
                <p className="text-xs text-mist uppercase tracking-widest mb-3">Shipping</p>
                <p className="text-sm text-ink leading-relaxed">All prints ship flat via USPS or FedEx within 1–2 weeks of your order. Shipping is included in the US.</p>
              </div>
              <div>
                <p className="text-xs text-mist uppercase tracking-widest mb-3">Print Quality</p>
                <p className="text-sm text-ink leading-relaxed">Printed on archival matte paper or metal using pigment inks. Colors are calibrated to match what you see on screen.</p>
              </div>
              <div>
                <p className="text-xs text-mist uppercase tracking-widest mb-3">Questions?</p>
                <p className="text-sm text-ink">Email <a href="mailto:imadobegi@gmail.com" className="text-copper hover:underline">imadobegi@gmail.com</a></p>
              </div>
            </div>

          </div>
        )}
      </div>
    </Layout>
  )
}
