import type { NextApiRequest, NextApiResponse } from 'next'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const IMAD_EMAIL = 'imadobegi@gmail.com'
const FROM = 'OBGillustrator <orders@obgillustrator.com>'

interface OrderItem {
  productName: string
  size: string
  medium: string
  quantity: number
  price: number
}

interface OrderPayload {
  customerName: string
  customerEmail: string
  address: string
  city: string
  state: string
  zip: string
  items: OrderItem[]
  total: number
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { customerName, customerEmail, address, city, state, zip, items, total }: OrderPayload = req.body

  if (!customerEmail || !items?.length) return res.status(400).json({ error: 'Missing fields' })

  const itemRows = items.map(i =>
    `<tr>
      <td style="padding:8px 0;border-bottom:1px solid #e8e0d4;">${i.productName}</td>
      <td style="padding:8px 0;border-bottom:1px solid #e8e0d4;color:#9A8878;">${i.size} · ${i.medium}</td>
      <td style="padding:8px 0;border-bottom:1px solid #e8e0d4;text-align:center;">${i.quantity}</td>
      <td style="padding:8px 0;border-bottom:1px solid #e8e0d4;text-align:right;">$${(i.price * i.quantity).toFixed(2)}</td>
    </tr>`
  ).join('')

  const shippingLine = [address, city, state, zip].filter(Boolean).join(', ')

  // ── Customer confirmation email ──
  const customerHtml = `
    <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#2C1F14;padding:40px 20px;">
      <h1 style="font-size:28px;font-weight:normal;margin-bottom:4px;">Order received.</h1>
      <p style="color:#9A8878;font-size:14px;margin-top:0;">OBGillustrator.com</p>

      <p style="font-size:15px;line-height:1.6;margin-top:24px;">
        Hi ${customerName} — your order is in. Imad makes each print to order, so please allow
        1–2 weeks for production. Your print will ship flat and arrive ready to frame or hang.
      </p>

      <table style="width:100%;border-collapse:collapse;margin-top:28px;font-size:14px;">
        <thead>
          <tr style="border-bottom:2px solid #2C1F14;">
            <th style="text-align:left;padding-bottom:8px;">Print</th>
            <th style="text-align:left;padding-bottom:8px;color:#9A8878;">Specs</th>
            <th style="text-align:center;padding-bottom:8px;">Qty</th>
            <th style="text-align:right;padding-bottom:8px;">Price</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <div style="margin-top:16px;text-align:right;font-size:15px;">
        <strong>Total: $${total.toFixed(2)}</strong>
        <span style="display:block;font-size:12px;color:#9A8878;">Shipping included</span>
      </div>

      ${shippingLine ? `<p style="font-size:14px;color:#9A8878;margin-top:20px;">Ships to: ${shippingLine}</p>` : ''}

      <p style="font-size:14px;line-height:1.6;margin-top:32px;padding-top:20px;border-top:1px solid #e8e0d4;color:#9A8878;">
        Questions? Reply to this email or reach out at ${IMAD_EMAIL}.
      </p>
    </div>
  `

  // ── Imad notification email ──
  const imadHtml = `
    <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#2C1F14;padding:40px 20px;">
      <h1 style="font-size:24px;font-weight:normal;">New order — $${total.toFixed(2)}</h1>

      <table style="width:100%;border-collapse:collapse;margin-top:20px;font-size:14px;">
        <thead>
          <tr style="border-bottom:2px solid #2C1F14;">
            <th style="text-align:left;padding-bottom:8px;">Print</th>
            <th style="text-align:left;padding-bottom:8px;">Specs</th>
            <th style="text-align:center;padding-bottom:8px;">Qty</th>
            <th style="text-align:right;padding-bottom:8px;">Price</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <div style="margin-top:16px;text-align:right;font-size:15px;">
        <strong>Total: $${total.toFixed(2)}</strong>
      </div>

      <div style="margin-top:28px;padding:16px;background:#f5f0e8;font-size:14px;line-height:1.8;">
        <strong>Customer</strong><br/>
        ${customerName}<br/>
        ${customerEmail}<br/>
        ${shippingLine || 'No shipping address provided'}
      </div>
    </div>
  `

  try {
    await Promise.all([
      resend.emails.send({
        from: FROM,
        to: customerEmail,
        replyTo: IMAD_EMAIL,
        subject: 'Your order from OBGillustrator.com',
        html: customerHtml,
      }),
      resend.emails.send({
        from: FROM,
        to: IMAD_EMAIL,
        subject: `New order: $${total.toFixed(2)} from ${customerName}`,
        html: imadHtml,
      }),
    ])
    res.status(200).json({ ok: true })
  } catch (err: unknown) {
    console.error('Email error:', err)
    // Don't block the order — just log the failure
    res.status(200).json({ ok: true, emailError: String(err) })
  }
}
