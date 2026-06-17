import { useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { useCart } from '../components/CartContext'

function CardIcon() {
  return (
    <svg className="w-5 h-5 text-mist" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  )
}

export default function Checkout() {
  const { items, total, clearCart } = useCart()
  const router = useRouter()

  const [form, setForm] = useState({
    email: '', name: '', address: '', city: '', state: '', zip: '',
    card: '', expiry: '', cvc: '',
  })
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    setError('')
  }

  const formatCard = (val: string) =>
    val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4)
    return digits.length > 2 ? `${digits.slice(0, 2)} / ${digits.slice(2)}` : digits
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const rawCard = form.card.replace(/\s/g, '')

    if (!rawCard) { setError('Please enter a card number.'); return }
    if (rawCard !== '4242424242424242') {
      setError('Test mode: use card number 4242 4242 4242 4242')
      return
    }
    if (!form.email || !form.name) { setError('Please fill in all required fields.'); return }

    setProcessing(true)
    await new Promise(r => setTimeout(r, 2200))
    clearCart()
    router.push('/success')
  }

  const inputClass = "w-full bg-transparent border border-edge text-ink placeholder:text-mist px-4 py-3 text-sm focus:outline-none focus:border-shadow transition-colors"

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

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 space-y-6">

              {/* Test mode banner */}
              <div className="bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                <strong>Demo mode.</strong> Use card <span className="font-mono tracking-wider">4242 4242 4242 4242</span>, any expiry, any CVC.
              </div>

              <div>
                <p className="text-xs text-mist uppercase tracking-widest mb-3">Contact</p>
                <input type="email" placeholder="Email address *" value={form.email} onChange={set('email')} className={inputClass} required />
              </div>

              <div>
                <p className="text-xs text-mist uppercase tracking-widest mb-3">Shipping</p>
                <div className="space-y-2">
                  <input type="text" placeholder="Full name *" value={form.name} onChange={set('name')} className={inputClass} required />
                  <input type="text" placeholder="Address" value={form.address} onChange={set('address')} className={inputClass} />
                  <div className="flex gap-2">
                    <input type="text" placeholder="City" value={form.city} onChange={set('city')} className={inputClass} />
                    <input type="text" placeholder="State" value={form.state} onChange={set('state')} className={`${inputClass} w-24 flex-shrink-0`} />
                    <input type="text" placeholder="ZIP" value={form.zip} onChange={set('zip')} className={`${inputClass} w-28 flex-shrink-0`} />
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs text-mist uppercase tracking-widest mb-3 flex items-center gap-2">
                  Payment <CardIcon />
                </p>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Card number"
                    value={form.card}
                    onChange={e => setForm(p => ({ ...p, card: formatCard(e.target.value) }))}
                    className={`${inputClass} font-mono tracking-wider`}
                    maxLength={19}
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="MM / YY"
                      value={form.expiry}
                      onChange={e => setForm(p => ({ ...p, expiry: formatExpiry(e.target.value) }))}
                      className={`${inputClass} font-mono`}
                      maxLength={7}
                    />
                    <input
                      type="text"
                      placeholder="CVC"
                      value={form.cvc}
                      onChange={e => setForm(p => ({ ...p, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                      className={`${inputClass} font-mono`}
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={processing}
                className="w-full bg-shadow text-canvas py-4 text-sm tracking-wider uppercase hover:bg-ink transition-colors disabled:opacity-60 disabled:cursor-wait"
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing...
                  </span>
                ) : `Pay $${total.toFixed(2)}`}
              </button>

              <p className="text-xs text-mist text-center">
                Prints ship flat within 1–2 weeks. Shipping included in the US.
              </p>
            </form>

            {/* Order summary */}
            <div className="md:w-80 flex-shrink-0">
              <div className="bg-canvas border border-edge p-6 sticky top-6">
                <h2 className="font-serif text-base text-ink mb-4">Order Summary</h2>
                <ul className="space-y-3 mb-4">
                  {items.map(item => (
                    <li key={item.id} className="flex gap-3">
                      <div className="w-12 h-12 bg-darkroom overflow-hidden flex-shrink-0 photo-wrapper">
                        <img src={`/photos/${item.category}/${item.image}`} alt={item.productName} className="w-full h-full object-cover photo-protected" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-ink leading-snug truncate">{item.productName}</p>
                        <p className="text-xs text-mist">{item.size} · {item.medium} · qty {item.quantity}</p>
                      </div>
                      <p className="text-sm text-ink flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</p>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-edge pt-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-mist">Subtotal</span>
                    <span className="text-ink">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-mist">Shipping</span>
                    <span className="text-ink">Included</span>
                  </div>
                  <div className="flex justify-between font-medium text-sm pt-2 border-t border-edge">
                    <span className="text-ink">Total</span>
                    <span className="text-ink">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
