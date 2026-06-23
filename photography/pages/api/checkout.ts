import fs from 'fs'
import path from 'path'
import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { CartItem } from '../../components/CartContext'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

function getValidPrices(): Map<string, number> {
  try {
    const configPath = path.join(process.cwd(), 'public', 'photos', 'config.json')
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    const prices = new Map<string, number>()
    for (const s of config.printSizes || []) {
      prices.set(s.label, s.price)
    }
    return prices
  } catch {
    return new Map()
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { items } = req.body as { items: CartItem[] }
  if (!items?.length) return res.status(400).json({ error: 'No items in cart' })

  // Verify prices server-side — never trust client-supplied prices
  const validPrices = getValidPrices()
  for (const item of items) {
    if (typeof item.price !== 'number' || item.price <= 0) {
      return res.status(400).json({ error: 'Invalid item price' })
    }
    const expected = validPrices.get(item.size)
    if (expected !== undefined && Math.abs(item.price - expected) > 0.01) {
      return res.status(400).json({ error: 'Price mismatch — please refresh and try again' })
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
