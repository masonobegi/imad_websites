import { useState } from 'react'
import Head from 'next/head'
import { GetServerSideProps } from 'next'
import Stripe from 'stripe'
import AdminLayout from '../../components/AdminLayout'
import { checkAdminCookie } from '../../lib/admin'

interface OrderItem { name: string; quantity: number; amount: number }

interface AdminOrder {
  sessionId: string
  paymentIntentId: string | null
  date: number
  customerName: string
  customerEmail: string
  items: OrderItem[]
  total: number
  paymentStatus: string
  shippingAddress: string
  status: 'awaiting' | 'shipped'
  tracking: string
  notes: string
  shippedAt: string
}

interface Props { initialOrders: AdminOrder[] }

function fmtDate(ts: number) {
  return new Date(ts * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}
function fmtMoney(cents: number) {
  return '$' + (cents / 100).toFixed(0)
}

export default function AdminOrders({ initialOrders }: Props) {
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders)
  const [filter, setFilter] = useState<'all' | 'awaiting' | 'shipped'>('awaiting')
  const [shippingModal, setShippingModal] = useState<AdminOrder | null>(null)
  const [tracking, setTracking] = useState('')
  const [noteText, setNoteText] = useState('')
  const [saving, setSaving] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const paid = orders.filter(o => o.paymentStatus === 'paid')
  const awaiting = paid.filter(o => o.status === 'awaiting')
  const shipped = paid.filter(o => o.status === 'shipped')
  const revenue = paid.reduce((s, o) => s + o.total, 0)
  const displayed = filter === 'all' ? paid : filter === 'awaiting' ? awaiting : shipped

  const refresh = async () => {
    setRefreshing(true)
    const res = await fetch('/api/admin/orders')
    if (res.ok) { const d = await res.json(); setOrders(d.orders) }
    setRefreshing(false)
  }

  const openShip = (order: AdminOrder) => {
    setShippingModal(order)
    setTracking(order.tracking || '')
    setNoteText(order.notes || '')
  }

  const markShipped = async () => {
    if (!shippingModal?.paymentIntentId) return
    setSaving(true)
    const res = await fetch(`/api/admin/orders/${shippingModal.paymentIntentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'shipped', tracking, notes: noteText }),
    })
    if (res.ok) {
      setOrders(prev => prev.map(o =>
        o.sessionId === shippingModal.sessionId
          ? { ...o, status: 'shipped', tracking, notes: noteText, shippedAt: new Date().toISOString() }
          : o
      ))
      setShippingModal(null)
    }
    setSaving(false)
  }

  const undoShipped = async (order: AdminOrder) => {
    if (!order.paymentIntentId) return
    await fetch(`/api/admin/orders/${order.paymentIntentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'awaiting', tracking: '', notes: order.notes }),
    })
    setOrders(prev => prev.map(o =>
      o.sessionId === order.sessionId ? { ...o, status: 'awaiting', shippedAt: '' } : o
    ))
  }

  return (
    <AdminLayout>
      <Head><title>Orders | OBG Admin</title></Head>

      <div className="px-4 sm:px-8 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Orders</h1>
          <button
            onClick={refresh}
            disabled={refreshing}
            className="text-sm text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50 bg-white"
          >
            {refreshing ? 'Refreshing…' : '↻ Refresh'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">Total Orders</p>
            <p className="text-2xl font-semibold text-gray-800">{paid.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">Revenue</p>
            <p className="text-2xl font-semibold text-gray-800">{fmtMoney(revenue)}</p>
          </div>
          <div className={`rounded-xl border p-4 ${awaiting.length > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200'}`}>
            <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">Need Shipping</p>
            <p className={`text-2xl font-semibold ${awaiting.length > 0 ? 'text-amber-700' : 'text-gray-800'}`}>
              {awaiting.length}
            </p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5 w-fit">
          {[
            { key: 'awaiting', label: `To Ship (${awaiting.length})` },
            { key: 'all', label: `All (${paid.length})` },
            { key: 'shipped', label: `Shipped (${shipped.length})` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as typeof filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === tab.key ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Order list */}
        {displayed.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-400">{filter === 'awaiting' ? 'No orders waiting to ship — nice work!' : 'No orders yet'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayed.map(order => (
              <div key={order.sessionId} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Header row */}
                <div className="px-5 py-4 flex flex-wrap items-start justify-between gap-3 border-b border-gray-100">
                  <div>
                    <p className="font-semibold text-gray-800">{order.customerName}</p>
                    <p className="text-sm text-gray-500">{order.customerEmail}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{fmtDate(order.date)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-semibold text-gray-800">{fmtMoney(order.total)}</p>
                    {order.status === 'shipped' ? (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
                        ✓ Shipped
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full">
                        ⏳ To Ship
                      </span>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="px-5 py-3 space-y-1.5">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">
                        {item.name}
                        {item.quantity > 1 && <span className="text-gray-400 ml-1">×{item.quantity}</span>}
                      </span>
                      <span className="text-gray-500 font-medium">{fmtMoney(item.amount)}</span>
                    </div>
                  ))}
                </div>

                {/* Shipping info */}
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">Ship to</p>
                  <p className="text-sm text-gray-600">{order.shippingAddress}</p>
                  {order.tracking && <p className="text-xs text-gray-400 mt-1">Tracking: {order.tracking}</p>}
                  {order.notes && <p className="text-xs text-gray-400 mt-0.5">Note: {order.notes}</p>}
                  {order.shippedAt && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Shipped {new Date(order.shippedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="px-5 py-3 flex items-center gap-3 border-t border-gray-100">
                  {order.status === 'awaiting' ? (
                    <button
                      onClick={() => openShip(order)}
                      className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                      Mark as Shipped ✓
                    </button>
                  ) : (
                    <button
                      onClick={() => undoShipped(order)}
                      className="text-gray-400 hover:text-gray-600 text-sm border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Undo Shipped
                    </button>
                  )}
                  <a
                    href={`mailto:${order.customerEmail}?subject=Your order from OBGillustrator.com`}
                    className="text-sm text-amber-600 hover:text-amber-700 transition-colors"
                  >
                    Email Customer
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mark Shipped modal */}
      {shippingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShippingModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Mark as Shipped</h2>
            <p className="text-sm text-gray-500 mb-5">
              Order for <strong>{shippingModal.customerName}</strong> — {fmtMoney(shippingModal.total)}
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tracking Number <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={tracking}
                  onChange={e => setTracking(e.target.value)}
                  placeholder="e.g. 9400111899…"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Note <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="e.g. Shipped USPS Priority"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={markShipped}
                disabled={saving}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-xl transition-colors disabled:opacity-60 text-sm"
              >
                {saving ? 'Saving…' : 'Confirm Shipped ✓'}
              </button>
              <button
                onClick={() => setShippingModal(null)}
                className="px-5 py-2.5 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  if (!checkAdminCookie(req.headers.cookie || '')) {
    return { redirect: { destination: '/admin/login', permanent: false } }
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)
    const response = await stripe.checkout.sessions.list({
      limit: 100,
      expand: ['data.line_items', 'data.payment_intent'],
    })

    const orders = response.data.map(session => {
      const pi = session.payment_intent as Stripe.PaymentIntent | null
      const meta = pi?.metadata || {}
      const items = (session.line_items?.data || []).map(item => ({
        name: item.description || 'Item',
        quantity: item.quantity || 1,
        amount: item.amount_total || 0,
      }))
      let shippingAddress = 'Not provided'
      const addr = session.shipping_details?.address
      if (addr) {
        shippingAddress = [addr.line1, addr.line2, addr.city, addr.state, addr.postal_code, addr.country]
          .filter(Boolean).join(', ')
      }
      return {
        sessionId: session.id,
        paymentIntentId: pi?.id || null,
        date: session.created,
        customerName: session.customer_details?.name || 'Unknown',
        customerEmail: session.customer_details?.email || '',
        items,
        total: session.amount_total || 0,
        paymentStatus: session.payment_status,
        shippingAddress,
        status: (meta.shipped === 'true' ? 'shipped' : 'awaiting') as 'awaiting' | 'shipped',
        tracking: meta.tracking || '',
        notes: meta.notes || '',
        shippedAt: meta.shipped_at || '',
      }
    })
    orders.sort((a, b) => b.date - a.date)
    return { props: { initialOrders: orders } }
  } catch {
    return { props: { initialOrders: [] } }
  }
}
