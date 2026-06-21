import { NextApiRequest, NextApiResponse } from 'next'
import { COOKIE } from '../../../lib/admin'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  res.setHeader('Set-Cookie', `${COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict`)
  res.json({ ok: true })
}
