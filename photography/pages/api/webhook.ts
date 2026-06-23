import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { Resend } from 'resend'

export const config = { api: { bodyParser: false } }

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)
const resend = new Resend(process.env.RESEND_API_KEY as string)

const IMAD_EMAIL = process.env.OWNER_EMAIL || 'imadobegi@gmail.com'
const FROM = process.env.RESEND_FROM || 'onboarding@resend.dev'

function getRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', chunk => chunks.push(Buffer.from(chunk)))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

function formatAddress(session: Stripe.Checkout.Session): string {
  const a = session.shipping_details?.address
  if (!a) return 'Not provided'
  return [session.shipping_details?.name, a.line1, a.line2, `${a.city}, ${a.state} ${a.postal_code}`, a.country]
    .filter(Boolean).join('\n')
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!sig || !webhookSecret) return res.status(400).json({ error: 'Missing config' })

  let event: Stripe.Event
  try {
    const rawBody = await getRawBody(req)
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch {
    return res.status(400).json({ error: 'Invalid webhook signature' })
  }

  if (event.type === 'checkout.session.completed') {
    const session = await stripe.checkout.sessions.retrieve(
      (event.data.object as Stripe.Checkout.Session).id,
      { expand: ['line_items'] }
    )

    const customerName = session.customer_details?.name || 'Customer'
    const customerEmail = session.customer_details?.email
    const total = `$${((session.amount_total || 0) / 100).toFixed(2)}`
    const address = formatAddress(session)
    const items = session.line_items?.data || []

    const itemRowsHtml = items.map(item => {
      const price = item.price?.unit_amount ? `$${(item.price.unit_amount / 100).toFixed(2)}` : ''
      return `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #e8e0d4;font-size:14px;">${item.description || ''}</td>
        <td style="padding:10px 0;border-bottom:1px solid #e8e0d4;font-size:14px;text-align:center;">${item.quantity}</td>
        <td style="padding:10px 0;border-bottom:1px solid #e8e0d4;font-size:14px;text-align:right;">${price}</td>
      </tr>`
    }).join('')

    try {
      // Email to customer
      if (customerEmail) {
        await resend.emails.send({
          from: FROM,
          to: customerEmail,
          reply_to: IMAD_EMAIL,
          subject: 'Your order from OBGillustrator.com',
          html: `
<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#2C1F14;padding:40px 20px;background:#FAF8F5;">
  <p style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#9A8878;margin:0 0 28px;">OBGillustrator.com</p>
  <h1 style="font-size:28px;font-weight:normal;margin:0 0 8px;">Order received.</h1>
  <p style="color:#9A8878;font-size:15px;margin:0 0 28px;">Hi ${customerName} — your prints are being made.</p>

  <table style="width:100%;border-collapse:collapse;">
    <thead>
      <tr style="border-bottom:2px solid #2C1F14;">
        <th style="text-align:left;padding-bottom:8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;font-weight:normal;color:#9A8878;">Print</th>
        <th style="text-align:center;padding-bottom:8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;font-weight:normal;color:#9A8878;">Qty</th>
        <th style="text-align:right;padding-bottom:8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;font-weight:normal;color:#9A8878;">Price</th>
      </tr>
    </thead>
    <tbody>${itemRowsHtml}</tbody>
  </table>

  <div style="text-align:right;padding:12px 0 28px;font-size:15px;">
    <strong>Total: ${total}</strong>
  </div>

  <div style="background:#fff;border:1px solid #e8e0d4;padding:16px;font-size:14px;line-height:1.8;color:#4A3728;">
    <strong style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#9A8878;">Ships to</strong><br/>
    <span style="white-space:pre-line;">${address}</span>
  </div>

  <p style="font-size:14px;line-height:1.7;color:#9A8878;margin-top:28px;">
    All prints ship flat within <strong style="color:#4A3728;">1–2 weeks</strong>.<br/>
    Imad will reach out if he has any questions about your order.
  </p>
  <p style="font-size:14px;color:#9A8878;">
    Questions? Reply to this email or write to <a href="mailto:${IMAD_EMAIL}" style="color:#C17F52;">${IMAD_EMAIL}</a>
  </p>
  <p style="font-size:12px;color:#C5B9AA;margin-top:32px;border-top:1px solid #e8e0d4;padding-top:16px;">
    © ${new Date().getFullYear()} Imad Obegi · OBGillustrator.com
  </p>
</div>`,
        })
      }

      // Email to Imad
      await resend.emails.send({
        from: FROM,
        to: IMAD_EMAIL,
        subject: `New order — ${total}`,
        html: `
<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;padding:32px 20px;">
  <h2 style="margin:0 0 4px;">New order — ${total}</h2>
  <p style="color:#666;font-size:13px;margin:0 0 24px;">Stripe session: <code style="background:#f4f4f4;padding:2px 6px;border-radius:3px;">${session.id}</code></p>

  <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
    <thead>
      <tr style="border-bottom:2px solid #1a1a1a;">
        <th style="text-align:left;padding-bottom:8px;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;color:#888;">Print</th>
        <th style="text-align:center;padding-bottom:8px;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;color:#888;">Qty</th>
        <th style="text-align:right;padding-bottom:8px;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;color:#888;">Price</th>
      </tr>
    </thead>
    <tbody>${itemRowsHtml}</tbody>
  </table>
  <div style="text-align:right;font-size:15px;padding-bottom:24px;"><strong>Total: ${total}</strong></div>

  <div style="background:#f9f7f4;border:1px solid #e0dbd4;padding:16px;font-size:14px;line-height:2;">
    <strong>${customerName}</strong><br/>
    ${customerEmail ? `<a href="mailto:${customerEmail}" style="color:#C17F52;">${customerEmail}</a><br/>` : ''}
    <span style="white-space:pre-line;color:#555;">${address}</span>
  </div>
</div>`,
      })
    } catch (err) {
      console.error('Failed to send emails:', err)
    }
  }

  res.json({ received: true })
}
