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
    const customerName = session.customer_details?.name || 'Customer'
    const amount = ((session.amount_total || 0) / 100).toFixed(2)
    const shipping = session.shipping_details?.address
    const shippingText = shipping
      ? `${shipping.line1}${shipping.line2 ? ', ' + shipping.line2 : ''}, ${shipping.city}, ${shipping.state} ${shipping.postal_code}, ${shipping.country}`
      : 'Not provided'

    const fromAddress = `Imad Fine Art <orders@${process.env.RESEND_FROM_DOMAIN || 'resend.dev'}>`
    const ownerEmail = process.env.OWNER_EMAIL as string

    try {
      if (customerEmail) {
        await resend.emails.send({
          from: fromAddress,
          to: customerEmail,
          subject: 'Your order from Imad Fine Art — thank you!',
          html: `
            <p style="font-family: Georgia, serif; font-size: 16px; color: #3D2B1F;">Hi ${customerName},</p>
            <p style="font-family: sans-serif; color: #5a4a3a; line-height: 1.6;">
              Thank you so much for your order. We've received it and Imad will be in touch within a couple of days with shipping details.
            </p>
            <p style="font-family: sans-serif; color: #5a4a3a;"><strong>Order total:</strong> $${amount}</p>
            <p style="font-family: sans-serif; color: #5a4a3a;"><strong>Shipping to:</strong> ${shippingText}</p>
            <p style="font-family: sans-serif; color: #5a4a3a; line-height: 1.6;">
              Each painting is carefully packed and typically ships within 2–3 weeks.
              If you have any questions, just reply to this email.
            </p>
            <p style="font-family: Georgia, serif; color: #8B4513; margin-top: 24px;">— Imad Fine Art</p>
          `,
        })
      }

      await resend.emails.send({
        from: fromAddress,
        to: ownerEmail,
        subject: `New order — $${amount}`,
        html: `
          <p style="font-family: sans-serif; color: #3D2B1F;"><strong>New order on Imad Fine Art!</strong></p>
          <p style="font-family: sans-serif; color: #5a4a3a;"><strong>Customer:</strong> ${customerName} (${customerEmail || 'no email'})</p>
          <p style="font-family: sans-serif; color: #5a4a3a;"><strong>Order total:</strong> $${amount}</p>
          <p style="font-family: sans-serif; color: #5a4a3a;"><strong>Ship to:</strong> ${shippingText}</p>
          <p style="font-family: sans-serif; color: #5a4a3a;">Log in to Stripe to see the full order details.</p>
        `,
      })
    } catch (emailErr) {
      console.error('Email send failed:', emailErr)
    }
  }

  res.json({ received: true })
}
