import { useCart } from './CartContext'
import { useState } from 'react'

interface CartPopupProps {
  onClose: () => void
}

export default function CartPopup({ onClose }: CartPopupProps) {
  const { items, removeItem, updateQuantity, total } = useCart()
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else setLoading(false)
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="fixed inset-0 bg-ink/20" onClick={onClose} />
      <div className="relative bg-canvas w-full max-w-sm h-full shadow-2xl flex flex-col border-l border-linen">

        <div className="flex items-center justify-between px-6 py-5 border-b border-linen">
          <h2 className="font-serif text-xl text-ink">Cart</h2>
          <button onClick={onClose} className="text-clay hover:text-ink transition-colors" aria-label="Close cart">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <p className="text-clay text-sm text-center mt-12">Nothing in your cart yet.</p>
          ) : (
            <ul className="space-y-5">
              {items.map(item => (
                <li key={item.id} className="flex gap-3 pb-5 border-b border-linen last:border-0">
                  <div
                    className="w-14 h-14 flex items-center justify-center text-2xl flex-shrink-0 rounded-sm"
                    style={{ backgroundColor: '#E8DDD088' }}
                  >
                    {item.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink leading-snug">{item.productName}</p>
                    <p className="text-xs text-clay mt-0.5">{item.size}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 border border-linen text-clay hover:border-bark hover:text-bark flex items-center justify-center text-sm transition-colors"
                      >−</button>
                      <span className="text-sm text-ink w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 border border-linen text-clay hover:border-bark hover:text-bark flex items-center justify-center text-sm transition-colors"
                      >+</button>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm text-ink">${(item.price * item.quantity).toFixed(2)}</p>
                    <button onClick={() => removeItem(item.id)} className="text-xs text-clay hover:text-bark mt-1 transition-colors">
                      remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-linen space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-clay">Subtotal</span>
              <span className="text-ink font-medium">${total.toFixed(2)}</span>
            </div>
            <p className="text-xs text-clay">Shipping calculated at checkout. All works ship within 2–3 weeks.</p>
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-bark text-canvas py-3 text-sm tracking-wider uppercase hover:bg-sienna transition-colors disabled:opacity-50"
            >
              {loading ? 'Redirecting...' : 'Checkout'}
            </button>
            <button
              onClick={onClose}
              className="w-full border border-linen text-ink py-3 text-sm tracking-wider uppercase hover:border-bark transition-colors"
            >
              Keep Shopping
            </button>
          </div>
        )}

        {items.length === 0 && (
          <div className="px-6 py-5 border-t border-linen">
            <button
              onClick={onClose}
              className="w-full border border-linen text-ink py-3 text-sm tracking-wider uppercase hover:border-bark transition-colors"
            >
              Back to Shop
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
