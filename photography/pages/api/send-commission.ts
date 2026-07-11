import type { NextApiRequest, NextApiResponse } from 'next'
import { Resend } from 'resend'
import { checkRateLimit } from '../../lib/rateLimit'

const resend = new Resend(process.env.RESEND_API_KEY)
const IMAD_EMAIL = 'imadobegi@gmail.com'
const FROM = 'OBGillustrator <onboarding@resend.dev>'
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,253}\.[^\s@]{2,}$/

function esc(v: unknown): string {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function getIp(req: NextApiRequest): string {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown'
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  if (!checkRateLimit(`commission:${getIp(req)}`, 5, 10 * 60 * 1000)) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' })
  }

  const { name, email, workType, description, budget } = req.body

  if (!name || !email || !description) {
    return res.status(400).json({ error: 'Missing required fields' })
  }
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Invalid email address' })
  if (String(description).length > 5000) return res.status(400).json({ error: 'Description too long' })

  try {
    await resend.emails.send({
      from: FROM,
      to: IMAD_EMAIL,
      reply_to: email,
      subject: `Custom Commission Request from ${esc(name)}`,
      html: `
        <h2>New Custom Commission Request</h2>
        <table style="border-collapse:collapse;width:100%;max-width:600px">
          <tr><td style="padding:8px 12px;font-weight:bold;background:#f5f0e8">Name</td><td style="padding:8px 12px">${esc(name)}</td></tr>
          <tr><td style="padding:8px 12px;font-weight:bold;background:#f5f0e8">Email</td><td style="padding:8px 12px"><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
          <tr><td style="padding:8px 12px;font-weight:bold;background:#f5f0e8">Type of Work</td><td style="padding:8px 12px">${esc(workType) || 'Not specified'}</td></tr>
          <tr><td style="padding:8px 12px;font-weight:bold;background:#f5f0e8">Budget</td><td style="padding:8px 12px">${esc(budget) || 'Not specified'}</td></tr>
          <tr><td style="padding:8px 12px;font-weight:bold;background:#f5f0e8;vertical-align:top">Request</td><td style="padding:8px 12px;white-space:pre-wrap">${esc(description)}</td></tr>
        </table>
        <p style="color:#888;font-size:12px;margin-top:24px">Reply directly to this email to respond to ${esc(name)}.</p>
      `,
    })

  } catch (err) {
    console.error('Commission email error:', err)
    return res.status(500).json({ error: 'Failed to send' })
  }

  return res.status(200).json({ ok: true })
}
