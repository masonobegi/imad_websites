import { NextApiRequest, NextApiResponse } from 'next'
import { createToken, COOKIE, COOKIE_MAX_AGE } from '../../../lib/admin'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { password } = req.body

  if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SECRET) {
    return res.status(500).json({ error: 'Admin credentials not configured' })
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Incorrect password' })
  }

  const token = createToken()
  res.setHeader('Set-Cookie', `${COOKIE}=${token}; HttpOnly; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Strict`)
  res.json({ ok: true })
}
