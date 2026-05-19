import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { Resend } from 'resend'

export const config = { api: { bodyParser: false } }

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)
const resend = new Resend(process.env.RESEND_API_KEY as string)

function getRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', chunk => chunks.push(Buffer.from(chunk)))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const sig = req.headers['stripe-signature']
  const rawBody = await getRawBody(req)

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig as string, process.env.STRIPE_WEBHOOK_SECRET as string)
  } catch {
    return res.status(400).json({ error: 'Invalid webhook signature' })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const customerEmail = session.customer_details?.email
    const customerName = session.customer_details?.name || 'there'
    const amount = ((session.amount_total || 0) / 100).toFixed(2)
    const shipping = session.shipping_details?.address
    const shippingText = shipping
      ? `${shipping.line1}${shipping.line2 ? ', ' + shipping.line2 : ''}, ${shipping.city}, ${shipping.state} ${shipping.postal_code}, ${shipping.country}`
      : 'Not provided'

    const fromAddress = `Imad AI Stickers <orders@${process.env.RESEND_FROM_DOMAIN || 'resend.dev'}>`
    const ownerEmail = process.env.OWNER_EMAIL as string

    try {
      if (customerEmail) {
        await resend.emails.send({
          from: fromAddress,
          to: customerEmail,
          subject: 'Your sticker order is confirmed!',
          html: `
            <p style="font-family: sans-serif; font-size: 16px; color: #3D1F00;">Hey ${customerName}!</p>
            <p style="font-family: sans-serif; color: #E8963A; line-height: 1.6;">
              Your sticker order is in! Everything ships in a rigid mailer within 5–7 business days.
            </p>
            <p style="font-family: sans-serif; color: #3D1F00;"><strong>Order total:</strong> $${amount}</p>
            <p style="font-family: sans-serif; color: #3D1F00;"><strong>Shipping to:</strong> ${shippingText}</p>
            <p style="font-family: sans-serif; color: #E8963A; line-height: 1.6;">
              Reply to this email if you have any questions about your order.
            </p>
            <p style="font-family: sans-serif; color: #CC5A00; font-weight: 600; margin-top: 24px;">— Imad AI Stickers</p>
          `,
        })
      }

      await resend.emails.send({
        from: fromAddress,
        to: ownerEmail,
        subject: `New sticker order — $${amount}`,
        html: `
          <p style="font-family: sans-serif; color: #3D1F00;"><strong>New sticker order!</strong></p>
          <p style="font-family: sans-serif; color: #E8963A;"><strong>Customer:</strong> ${customerName} (${customerEmail || 'no email'})</p>
          <p style="font-family: sans-serif; color: #E8963A;"><strong>Amount:</strong> $${amount}</p>
          <p style="font-family: sans-serif; color: #E8963A;"><strong>Ship to:</strong> ${shippingText}</p>
          <p style="font-family: sans-serif; color: #E8963A;">Log in to Stripe to see the full order.</p>
        `,
      })
    } catch (emailErr) {
      console.error('Email send failed:', emailErr)
    }
  }

  res.json({ received: true })
}
