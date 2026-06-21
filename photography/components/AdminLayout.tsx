import Link from 'next/link'
import { useRouter } from 'next/router'

interface Props { children: React.ReactNode }

const NAV = [
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/products', label: 'Products' },
]

export default function AdminLayout({ children }: Props) {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar — desktop */}
      <aside className="hidden sm:flex flex-col w-52 bg-white border-r border-gray-200 fixed h-full z-10">
        <div className="px-5 py-5 border-b border-gray-100">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">OBGillustrator</p>
          <p className="font-semibold text-gray-800 mt-0.5 text-sm">Admin</p>
        </div>
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {NAV.map(item => {
            const active = router.pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? 'bg-amber-50 text-amber-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="px-2 pb-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            Log Out
          </button>
        </div>
      </aside>

      {/* Top bar — mobile */}
      <div className="sm:hidden fixed top-0 inset-x-0 z-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 h-12">
        <p className="font-semibold text-gray-800 text-sm">OBG Admin</p>
        <div className="flex items-center gap-4">
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium ${router.pathname.startsWith(item.href) ? 'text-amber-700' : 'text-gray-500'}`}
            >
              {item.label}
            </Link>
          ))}
          <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-red-500">Out</button>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 sm:ml-52 pt-12 sm:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  )
}
