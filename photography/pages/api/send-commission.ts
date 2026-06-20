import type { NextApiRequest, NextApiResponse } from 'next'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const IMAD_EMAIL = 'imadobegi@gmail.com'
const FROM = 'OBGillustrator <orders@obgillustrator.com>'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { name, email, workType, description, budget } = req.body

  if (!name || !email || !description) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    await resend.emails.send({
      from: FROM,
      to: IMAD_EMAIL,
      reply_to: email,
      subject: `Custom Commission Request from ${name}`,
      html: `
        <h2>New Custom Commission Request</h2>
        <table style="border-collapse:collapse;width:100%;max-width:600px">
          <tr><td style="padding:8px 12px;font-weight:bold;background:#f5f0e8">Name</td><td style="padding:8px 12px">${name}</td></tr>
          <tr><td style="padding:8px 12px;font-weight:bold;background:#f5f0e8">Email</td><td style="padding:8px 12px"><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding:8px 12px;font-weight:bold;background:#f5f0e8">Type of Work</td><td style="padding:8px 12px">${workType || 'Not specified'}</td></tr>
          <tr><td style="padding:8px 12px;font-weight:bold;background:#f5f0e8">Budget</td><td style="padding:8px 12px">${budget || 'Not specified'}</td></tr>
          <tr><td style="padding:8px 12px;font-weight:bold;background:#f5f0e8;vertical-align:top">Request</td><td style="padding:8px 12px;white-space:pre-wrap">${description}</td></tr>
        </table>
        <p style="color:#888;font-size:12px;margin-top:24px">Reply directly to this email to respond to ${name}.</p>
      `,
    })

    await resend.emails.send({
      from: FROM,
      to: email,
      reply_to: IMAD_EMAIL,
      subject: `Your commission request — Imad / OBGillustrator`,
      html: `
        <p>Hi ${name},</p>
        <p>Thank you for reaching out! Imad has received your commission request and will be in touch soon.</p>
        <p><strong>Your request:</strong><br/><span style="white-space:pre-wrap">${description}</span></p>
        <p>— Imad Obegi<br/><a href="https://obgillustrator.com">OBGillustrator.com</a></p>
      `,
    })
  } catch (err) {
    console.error('Commission email error:', err)
  }

  return res.status(200).json({ ok: true })
}
