import { NextApiRequest, NextApiResponse } from 'next'
import { requireAdmin } from '../../../lib/admin'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return
  if (req.method !== 'POST') return res.status(405).end()

  await Promise.all([
    prisma.siteConfig.deleteMany({ where: { key: { in: ['pageviews', 'pageviews_daily', 'referrers'] } } }),
  ])

  res.json({ ok: true })
}
