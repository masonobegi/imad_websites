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
      <div className="relative bg-canvas w-full max-w-sm h-full shadow-2xl flex flex-col border-l border-peach">

        <div className="flex items-center justify-between px-6 py-5 border-b border-peach">
          <h2 className="text-xl font-semibold text-ink">Cart</h2>
          <button onClick={onClose} className="text-amber hover:text-ink transition-colors" aria-label="Close cart">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <p className="text-amber text-sm text-center mt-12">Your cart is empty.</p>
          ) : (
            <ul className="space-y-5">
              {items.map(item => (
                <li key={item.id} className="flex gap-3 pb-5 border-b border-peach last:border-0">
                  <div
                    className="w-14 h-14 flex items-center justify-center text-2xl flex-shrink-0 rounded-md"
                    style={{ backgroundColor: '#FFD9A888' }}
                  >
                    {item.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink leading-snug">{item.productName}</p>
                    <p className="text-xs text-amber mt-0.5">{item.packSize}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 border border-peach text-amber hover:border-ember hover:text-ember flex items-center justify-center text-sm transition-colors rounded"
                      >−</button>
                      <span className="text-sm text-ink w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 border border-peach text-amber hover:border-ember hover:text-ember flex items-center justify-center text-sm transition-colors rounded"
                      >+</button>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm text-ink">${(item.price * item.quantity).toFixed(2)}</p>
                    <button onClick={() => removeItem(item.id)} className="text-xs text-amber hover:text-ember mt-1 transition-colors">
                      remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-peach space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-amber">Subtotal</span>
              <span className="text-ink font-semibold">${total.toFixed(2)}</span>
            </div>
            <p className="text-xs text-amber">Stickers ship in a rigid mailer within 5–7 business days.</p>
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-ember text-canvas py-3 text-sm font-semibold tracking-wide rounded hover:bg-rust transition-colors disabled:opacity-50"
            >
              {loading ? 'Redirecting...' : 'Checkout'}
            </button>
            <button
              onClick={onClose}
              className="w-full border border-peach text-ink py-3 text-sm font-semibold tracking-wide rounded hover:border-ember transition-colors"
            >
              Keep Shopping
            </button>
          </div>
        )}

        {items.length === 0 && (
          <div className="px-6 py-5 border-t border-peach">
            <button
              onClick={onClose}
              className="w-full border border-peach text-ink py-3 text-sm font-semibold rounded hover:border-ember transition-colors"
            >
              Back to Shop
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
