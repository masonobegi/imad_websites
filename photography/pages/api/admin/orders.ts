import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { requireAdmin } from '../../../lib/admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return
  if (req.method !== 'GET') return res.status(405).end()

  try {
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
        status: meta.shipped === 'true' ? 'shipped' : 'awaiting',
        tracking: meta.tracking || '',
        notes: meta.notes || '',
        shippedAt: meta.shipped_at || '',
      }
    })

    orders.sort((a, b) => b.date - a.date)
    res.json({ orders })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load orders from Stripe' })
  }
}
