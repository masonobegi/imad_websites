import Header from './Header'
import Footer from './Footer'
import { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
  dark?: boolean
}

export default function Layout({ children, dark = false }: LayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col ${dark ? 'bg-darkroom' : 'bg-canvas'}`}>
      <Header dark={dark} />
      <main className="flex-1">{children}</main>
      <Footer dark={dark} />
    </div>
  )
}
