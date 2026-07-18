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
  const [menuOpen, setMenuOpen] = useState(false)

  const bg    = dark ? 'bg-darkroom border-panel'   : 'bg-canvas border-edge'
  const text  = dark ? 'text-edge'                  : 'text-ink'
  const sub   = dark ? 'text-mist'                  : 'text-copper'
  const hover = dark ? 'hover:text-copper'           : 'hover:text-shadow'
  const badge = dark ? 'bg-copper text-darkroom'    : 'bg-shadow text-canvas'
  const menuBg = dark ? 'bg-darkroom border-panel'  : 'bg-canvas border-edge'

  return (
    <>
      <header className={`${bg} border-b relative z-30`}>
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">

          {/* Logo */}
          <div>
            <Link href="/" className={`font-serif text-xl sm:text-2xl ${text} tracking-wide ${hover} transition-colors inline-flex items-center gap-2`}>
              <svg className="w-4 h-4 opacity-60 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
              Imad Obegi
            </Link>
            <p className={`text-xs ${sub} tracking-[0.15em] mt-0.5`}>OBGillustrator.com</p>
          </div>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-6">
            <Link href="/shop" className={`text-sm ${text} ${hover} transition-colors`}>Photography</Link>
            <Link href="/fine-art" className={`text-sm ${text} ${hover} transition-colors`}>Fine Art</Link>
            <Link href="/stickers" className={`text-sm ${text} ${hover} transition-colors`}>Stickers</Link>
            <Link href="/digital" className={`text-sm ${text} ${hover} transition-colors`}>Digital Services</Link>
            <Link href="/process" className={`text-sm ${text} ${hover} transition-colors`}>Process</Link>

            <Link href="/about" className={`text-sm ${text} ${hover} transition-colors`}>About</Link>
            <Link href="/contact" className={`text-sm ${text} ${hover} transition-colors`}>Contact</Link>
            <Link
              href="/commissions"
              className="text-sm px-3 py-1.5 bg-copper text-darkroom hover:bg-amber-600 transition-colors tracking-wide"
            >
              Commission
            </Link>
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

          {/* Mobile: cart + hamburger */}
          <div className="flex sm:hidden items-center gap-3">
            <button
              onClick={() => setCartOpen(true)}
              className={`relative p-2 ${text} ${hover} transition-colors`}
              aria-label="Open cart"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {itemCount > 0 && (
                <span className={`absolute top-0.5 right-0.5 ${badge} text-xs w-4 h-4 rounded-full flex items-center justify-center leading-none`}>
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMenuOpen(o => !o)}
              className={`p-2 ${text} ${hover} transition-colors`}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className={`sm:hidden ${menuBg} border-t px-5 py-4 flex flex-col gap-4`}>
            <Link href="/" onClick={() => setMenuOpen(false)} className={`text-base ${text} ${hover} transition-colors`}>All Work</Link>
            <Link href="/shop" onClick={() => setMenuOpen(false)} className={`text-base ${text} ${hover} transition-colors`}>Photography</Link>
            <Link href="/fine-art" onClick={() => setMenuOpen(false)} className={`text-base ${text} ${hover} transition-colors`}>Fine Art</Link>
            <Link href="/stickers" onClick={() => setMenuOpen(false)} className={`text-base ${text} ${hover} transition-colors`}>Stickers</Link>
            <Link href="/digital" onClick={() => setMenuOpen(false)} className={`text-base ${text} ${hover} transition-colors`}>Digital Services</Link>
            <Link href="/process" onClick={() => setMenuOpen(false)} className={`text-base ${text} ${hover} transition-colors`}>Art Process</Link>
            <Link href="/about" onClick={() => setMenuOpen(false)} className={`text-base ${text} ${hover} transition-colors`}>About</Link>
            <Link href="/contact" onClick={() => setMenuOpen(false)} className={`text-base ${text} ${hover} transition-colors`}>Contact</Link>
            <Link
              href="/commissions"
              onClick={() => setMenuOpen(false)}
              className="text-base px-4 py-2 bg-copper text-darkroom hover:bg-amber-600 transition-colors tracking-wide inline-block text-center"
            >
              Commission a Piece
            </Link>
          </div>
        )}
      </header>

      {cartOpen && <CartPopup onClose={() => setCartOpen(false)} dark={dark} />}
    </>
  )
}
