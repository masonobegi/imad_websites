import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { requireAdmin } from '../../../../lib/admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return
  if (req.method !== 'PATCH') return res.status(405).end()

  const { id } = req.query as { id: string }
  const { status, tracking, notes } = req.body

  try {
    await stripe.paymentIntents.update(id, {
      metadata: {
        shipped: status === 'shipped' ? 'true' : 'false',
        tracking: tracking || '',
        notes: notes || '',
        shipped_at: status === 'shipped' ? new Date().toISOString() : '',
      },
    })
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update order' })
  }
}
