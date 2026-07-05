import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { path } = req.body
  if (!path || typeof path !== 'string') return res.json({ ok: true })

  const clean = path.split('?')[0].slice(0, 200)
  if (clean.startsWith('/admin') || clean.startsWith('/api')) return res.json({ ok: true })

  try {
    const row = await prisma.siteConfig.findUnique({ where: { key: 'pageviews' } })
    const data: Record<string, number> = row ? JSON.parse(row.value) : {}
    data[clean] = (data[clean] || 0) + 1
    await prisma.siteConfig.upsert({
      where: { key: 'pageviews' },
      update: { value: JSON.stringify(data) },
      create: { key: 'pageviews', value: JSON.stringify(data) },
    })
  } catch {
    // Never fail a page load for analytics
  }

  res.json({ ok: true })
}
