import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { CartItem } from '../../components/CartContext'
import { prisma } from '../../lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

async function getValidPrices(): Promise<Map<string, number>> {
  try {
    const sizes = await prisma.printSize.findMany()
    return new Map(sizes.map(s => [s.label, s.price]))
  } catch {
    return new Map()
  }
}

async function validateFineArtPrice(productId: string, size: string, clientPrice: number): Promise<boolean> {
  try {
    const workId = productId.endsWith('-reprint') ? productId.slice(0, -8) : productId
    const work = await prisma.fineArtWork.findUnique({ where: { id: workId } })
    if (!work) return false
    const expected = size === 'Archival Reprint' ? work.reprintPrice : (work.originalPrice ?? work.price)
    if (expected === null || expected === undefined) return false
    return Math.abs(clientPrice - expected) <= 1.00
  } catch {
    return false
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { items } = req.body as { items: CartItem[] }
  if (!items?.length) return res.status(400).json({ error: 'No items in cart' })

  // Verify prices server-side — never trust client-supplied prices
  const validPrices = await getValidPrices()
  for (const item of items) {
    if (typeof item.price !== 'number' || item.price <= 0) {
      return res.status(400).json({ error: 'Invalid item price' })
    }
    if (item.size === 'Original' || item.size === 'Archival Reprint') {
      const valid = await validateFineArtPrice(item.productId, item.size, item.price)
      if (!valid) return res.status(400).json({ error: 'Price mismatch — please refresh and try again' })
    } else {
      const expected = validPrices.get(item.size)
      if (expected !== undefined && Math.abs(item.price - expected) > 1.00) {
        return res.status(400).json({ error: 'Price mismatch — please refresh and try again' })
      }
    }
    if (typeof item.quantity !== 'number' || item.quantity < 1 || item.quantity > 20) {
      return res.status(400).json({ error: 'Invalid quantity' })
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  try {
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${item.productName} — ${item.size}`,
          description: item.category,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }))

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'FR', 'DE'],
      },
      automatic_tax: { enabled: true },
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/shop`,
      metadata: { site: 'photography' },
    })

    res.json({ url: session.url })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create checkout session' })
  }
}
