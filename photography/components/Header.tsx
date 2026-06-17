import Link from 'next/link'
import { useState } from 'react'
import { useCart } from './CartContext'
import CartPopup from './CartPopup'

interface HeaderProps {
  dark?: boolean
}

export default function Header({ dark = false }: HeaderProps) {
  const { itemCount } = useCart()
  const [cartOpen, setCartOpen] = useState(false)

  const bg    = dark ? 'bg-darkroom border-panel'   : 'bg-canvas border-edge'
  const text  = dark ? 'text-edge'                  : 'text-ink'
  const sub   = dark ? 'text-mist'                  : 'text-copper'
  const hover = dark ? 'hover:text-copper'           : 'hover:text-shadow'
  const badge = dark ? 'bg-copper text-darkroom'    : 'bg-shadow text-canvas'

  return (
    <>
      <header className={`${bg} border-b`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <Link href="/" className={`font-serif text-2xl ${text} tracking-wide ${hover} transition-colors`}>
              Imad Photography
            </Link>
            <p className={`text-xs ${sub} tracking-[0.2em] uppercase mt-0.5`}>Fine Art Prints</p>
          </div>
          <nav className="flex items-center gap-8">
            <Link href="/" className={`text-sm ${text} ${hover} transition-colors`}>Home</Link>
            <Link href="/shop" className={`text-sm ${text} ${hover} transition-colors`}>Shop</Link>
            <button
              onClick={() => setCartOpen(true)}
              className={`relative p-1 ${text} ${hover} transition-colors`}
              aria-label="Open cart"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {itemCount > 0 && (
                <span className={`absolute -top-1 -right-1 ${badge} text-xs w-4 h-4 rounded-full flex items-center justify-center leading-none`}>
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>
      {cartOpen && <CartPopup onClose={() => setCartOpen(false)} dark={dark} />}
    </>
  )
}
