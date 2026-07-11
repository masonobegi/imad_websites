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

  if (!checkRateLimit(`inquiry:${getIp(req)}`, 5, 10 * 60 * 1000)) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' })
  }

  const { email, message, workTitle, workType, inquiryType } = req.body

  if (!email || !message || !workTitle) {
    return res.status(400).json({ error: 'Missing required fields' })
  }
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Invalid email address' })
  if (String(message).length > 5000) return res.status(400).json({ error: 'Message too long' })

  const subjectMap: Record<string, string> = {
    original: `Original Inquiry: ${esc(workTitle)}`,
    reprint:  `Reprint Inquiry: ${esc(workTitle)}`,
    general:  `Inquiry: ${esc(workTitle)}`,
  }
  const subject = subjectMap[inquiryType] ?? `Inquiry: ${esc(workTitle)}`

  try {
    await resend.emails.send({
      from: FROM,
      to: IMAD_EMAIL,
      reply_to: email,
      subject,
      html: `
        <h2>${subject}</h2>
        <table style="border-collapse:collapse;width:100%;max-width:600px">
          <tr><td style="padding:8px 12px;font-weight:bold;background:#f5f0e8">From</td><td style="padding:8px 12px"><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
          <tr><td style="padding:8px 12px;font-weight:bold;background:#f5f0e8">Work</td><td style="padding:8px 12px">${esc(workTitle)}${workType ? ` (${esc(workType)})` : ''}</td></tr>
          <tr><td style="padding:8px 12px;font-weight:bold;background:#f5f0e8;vertical-align:top">Message</td><td style="padding:8px 12px;white-space:pre-wrap">${esc(message)}</td></tr>
        </table>
        <p style="color:#888;font-size:12px;margin-top:24px">Reply directly to this email to respond.</p>
      `,
    })

  } catch (err) {
    console.error('Inquiry email error:', err)
    return res.status(500).json({ error: 'Failed to send' })
  }

  return res.status(200).json({ ok: true })
}
