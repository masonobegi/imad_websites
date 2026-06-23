import crypto from 'crypto'
import { NextApiRequest, NextApiResponse } from 'next'
import { createToken, COOKIE, COOKIE_MAX_AGE } from '../../../lib/admin'
import { checkRateLimit } from '../../../lib/rateLimit'

function getIp(req: NextApiRequest): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown'
  )
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const ip = getIp(req)
  if (!checkRateLimit(`login:${ip}`, 5, 15 * 60 * 1000)) {
    return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' })
  }

  const { password } = req.body

  if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SECRET) {
    return res.status(500).json({ error: 'Admin credentials not configured' })
  }

  // Constant-time comparison to prevent timing attacks
  const provided = Buffer.from(String(password || ''))
  const expected = Buffer.from(process.env.ADMIN_PASSWORD)
  const match =
    provided.length === expected.length &&
    crypto.timingSafeEqual(provided, expected)

  if (!match) {
    return res.status(401).json({ error: 'Incorrect password' })
  }

  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  const token = createToken()
  res.setHeader(
    'Set-Cookie',
    `${COOKIE}=${token}; HttpOnly; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Strict${secure}`
  )
  res.json({ ok: true })
}
