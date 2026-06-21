import type { NextApiRequest, NextApiResponse } from 'next'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const IMAD_EMAIL = 'imadobegi@gmail.com'
const FROM = 'OBGillustrator <orders@obgillustrator.com>'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { name, email, message } = req.body
  if (!email || !message) return res.status(400).json({ error: 'Missing required fields' })

  const displayName = name ? name : email

  try {
    await resend.emails.send({
      from: FROM,
      to: IMAD_EMAIL,
      reply_to: email,
      subject: `Message from ${displayName}`,
      html: `
        <h2>New message from OBGillustrator.com</h2>
        <table style="border-collapse:collapse;width:100%;max-width:600px">
          <tr><td style="padding:8px 12px;font-weight:bold;background:#f5f0e8">From</td><td style="padding:8px 12px">${displayName} &lt;<a href="mailto:${email}">${email}</a>&gt;</td></tr>
          <tr><td style="padding:8px 12px;font-weight:bold;background:#f5f0e8;vertical-align:top">Message</td><td style="padding:8px 12px;white-space:pre-wrap">${message}</td></tr>
        </table>
        <p style="color:#888;font-size:12px;margin-top:24px">Reply directly to this email to respond.</p>
      `,
    })

    await resend.emails.send({
      from: FROM,
      to: email,
      reply_to: IMAD_EMAIL,
      subject: `Your message to Imad — OBGillustrator.com`,
      html: `
        <p>Hi${name ? ` ${name}` : ''},</p>
        <p>Thanks for reaching out. Imad will get back to you soon.</p>
        <p><strong>Your message:</strong><br/><span style="white-space:pre-wrap">${message}</span></p>
        <p>— Imad Obegi<br/><a href="https://obgillustrator.com">OBGillustrator.com</a></p>
      `,
    })
  } catch (err) {
    console.error('Contact email error:', err)
    return res.status(500).json({ error: 'Failed to send' })
  }

  return res.status(200).json({ ok: true })
}
