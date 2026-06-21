import crypto from 'crypto'
import { NextApiRequest, NextApiResponse } from 'next'

export const COOKIE = 'obg_admin'
export const COOKIE_MAX_AGE = 7 * 24 * 60 * 60

export function createToken(): string {
  const secret = process.env.ADMIN_SECRET!
  const expires = Date.now() + COOKIE_MAX_AGE * 1000
  const payload = `admin:${expires}`
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  return Buffer.from(`${payload}:${sig}`).toString('base64')
}

export function verifyToken(token: string): boolean {
  try {
    const secret = process.env.ADMIN_SECRET!
    const decoded = Buffer.from(token, 'base64').toString()
    const lastColon = decoded.lastIndexOf(':')
    const payload = decoded.slice(0, lastColon)
    const sig = decoded.slice(lastColon + 1)
    const parts = payload.split(':')
    if (parts[0] !== 'admin') return false
    if (Date.now() > parseInt(parts[1])) return false
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex')
    const sigBuf = Buffer.from(sig, 'hex')
    const expBuf = Buffer.from(expected, 'hex')
    if (sigBuf.length !== expBuf.length) return false
    return crypto.timingSafeEqual(sigBuf, expBuf)
  } catch {
    return false
  }
}

export function getToken(req: NextApiRequest): string | null {
  const raw = req.headers.cookie || ''
  const match = raw.split(';').find(c => c.trim().startsWith(COOKIE + '='))
  return match ? match.trim().slice(COOKIE.length + 1) : null
}

export function requireAdmin(req: NextApiRequest, res: NextApiResponse): boolean {
  const token = getToken(req)
  if (!token || !verifyToken(token)) {
    res.status(401).json({ error: 'Unauthorized' })
    return false
  }
  return true
}

export function checkAdminCookie(cookieHeader: string): boolean {
  const match = cookieHeader.split(';').find(c => c.trim().startsWith(COOKIE + '='))
  if (!match) return false
  return verifyToken(match.trim().slice(COOKIE.length + 1))
}
