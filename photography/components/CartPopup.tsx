import { useCart } from './CartContext'
import { useRouter } from 'next/router'

interface CartPopupProps {
  onClose: () => void
  dark?: boolean
}

export default function CartPopup({ onClose, dark = false }: CartPopupProps) {
  const { items, removeItem, updateQuantity, total } = useCart()
  const router = useRouter()

  const bg     = dark ? 'bg-panel border-panel'  : 'bg-canvas border-edge'
  const text   = dark ? 'text-edge'              : 'text-ink'
  const sub    = dark ? 'text-mist'              : 'text-copper'
  const divider= dark ? 'border-darkroom'        : 'border-edge'
  const btnPrimary = dark
    ? 'bg-copper text-darkroom hover:bg-amber-600'
    : 'bg-shadow text-canvas hover:bg-ink'
  const btnSecondary = dark
    ? 'border border-panel text-mist hover:border-copper hover:text-copper'
    : 'border border-edge text-ink hover:border-shadow'

  const handleCheckout = () => {
    onClose()
    router.push('/checkout')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative ${bg} w-full max-w-sm h-full shadow-2xl flex flex-col border-l`}>

        <div className={`flex items-center justify-between px-6 py-5 border-b ${divider}`}>
          <h2 className={`font-serif text-xl ${text}`}>Cart</h2>
          <button onClick={onClose} className={`${sub} hover:${text} transition-colors`} aria-label="Close">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <p className={`${sub} text-sm text-center mt-12`}>Nothing here yet.</p>
          ) : (
            <ul className="space-y-5">
              {items.map(item => (
                <li key={item.id} className={`flex gap-3 pb-5 border-b ${divider} last:border-0`}>
                  <div className="w-14 h-14 bg-darkroom/20 rounded-sm overflow-hidden flex-shrink-0">
                    <img
                      src={`/photos/${item.category}/${item.image}?v=3`}
                      alt={item.productName}
                      className="w-full h-full object-cover photo-protected"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${text} leading-snug truncate`}>{item.productName}</p>
                    <p className={`text-xs ${sub} mt-0.5`}>{item.size} · {item.medium}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className={`w-6 h-6 border ${divider} ${sub} hover:border-copper hover:text-copper flex items-center justify-center text-sm transition-colors`}>−</button>
                      <span className={`text-sm ${text} w-5 text-center`}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className={`w-6 h-6 border ${divider} ${sub} hover:border-copper hover:text-copper flex items-center justify-center text-sm transition-colors`}>+</button>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm ${text}`}>${(item.price * item.quantity).toFixed(2)}</p>
                    <button onClick={() => removeItem(item.id)} className={`text-xs ${sub} hover:text-copper mt-1 transition-colors`}>remove</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className={`px-6 py-5 border-t ${divider} space-y-3`}>
            <div className="flex justify-between text-sm">
              <span className={sub}>Subtotal</span>
              <span className={`${text} font-medium`}>${total.toFixed(2)}</span>
            </div>
            <p className={`text-xs ${sub}`}>Shipping included in the US. Prints ship flat within 1–2 weeks.</p>
            <button onClick={handleCheckout} className={`w-full ${btnPrimary} py-3 text-sm tracking-wider uppercase transition-colors`}>
              Checkout
            </button>
            <button onClick={onClose} className={`w-full ${btnSecondary} py-3 text-sm tracking-wider uppercase transition-colors`}>
              Keep Shopping
            </button>
          </div>
        )}

        {items.length === 0 && (
          <div className={`px-6 py-5 border-t ${divider}`}>
            <button onClick={onClose} className={`w-full ${btnSecondary} py-3 text-sm tracking-wider uppercase transition-colors`}>
              Back to Shop
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
