import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { GetServerSideProps } from 'next'
import { checkAdminCookie } from '../../lib/admin'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        router.push('/admin/orders')
      } else {
        setError('Incorrect password — try again')
        setLoading(false)
      }
    } catch {
      setError('Connection error — try again')
      setLoading(false)
    }
  }

  return (
    <>
      <Head><title>Admin Login | OBGillustrator</title></Head>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
          <div className="text-center mb-8">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">OBGillustrator</p>
            <h1 className="text-xl font-semibold text-gray-800">Admin Dashboard</h1>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                placeholder="Enter admin password"
                required
                autoFocus
              />
            </div>
            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-lg">{error}</div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-60 text-sm"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  if (checkAdminCookie(req.headers.cookie || '')) {
    return { redirect: { destination: '/admin/orders', permanent: false } }
  }
  return { props: {} }
}
