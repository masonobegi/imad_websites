import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'

function parseDomain(url: string): string {
  if (!url) return 'direct'
  try {
    const host = new URL(url).hostname.replace(/^www\./, '')
    if (!host || host.includes('obgillustrator') || host.includes('railway') || host.includes('localhost')) {
      return 'direct'
    }
    return host
  } catch {
    return 'direct'
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { path, referrer } = req.body
  if (!path || typeof path !== 'string') return res.json({ ok: true })

  const clean = path.split('?')[0].slice(0, 200)
  if (clean.startsWith('/admin') || clean.startsWith('/api')) return res.json({ ok: true })

  const { checkAdminCookie } = await import('../../lib/admin')
  if (checkAdminCookie(req.headers.cookie || '')) return res.json({ ok: true })

  const domain = parseDomain(typeof referrer === 'string' ? referrer : '')
  const today = new Date().toISOString().split('T')[0]

  try {
    const [pvRow, dailyRow, refRow] = await Promise.all([
      prisma.siteConfig.findUnique({ where: { key: 'pageviews' } }),
      prisma.siteConfig.findUnique({ where: { key: 'pageviews_daily' } }),
      prisma.siteConfig.findUnique({ where: { key: 'referrers' } }),
    ])

    const totals: Record<string, number> = pvRow ? JSON.parse(pvRow.value) : {}
    totals[clean] = (totals[clean] || 0) + 1

    const daily: Record<string, Record<string, number>> = dailyRow ? JSON.parse(dailyRow.value) : {}
    if (!daily[today]) daily[today] = {}
    daily[today][clean] = (daily[today][clean] || 0) + 1
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 90)
    const cutoffStr = cutoff.toISOString().split('T')[0]
    for (const date of Object.keys(daily)) {
      if (date < cutoffStr) delete daily[date]
    }

    const refs: Record<string, number> = refRow ? JSON.parse(refRow.value) : {}
    refs[domain] = (refs[domain] || 0) + 1

    await Promise.all([
      prisma.siteConfig.upsert({
        where: { key: 'pageviews' },
        update: { value: JSON.stringify(totals) },
        create: { key: 'pageviews', value: JSON.stringify(totals) },
      }),
      prisma.siteConfig.upsert({
        where: { key: 'pageviews_daily' },
        update: { value: JSON.stringify(daily) },
        create: { key: 'pageviews_daily', value: JSON.stringify(daily) },
      }),
      prisma.siteConfig.upsert({
        where: { key: 'referrers' },
        update: { value: JSON.stringify(refs) },
        create: { key: 'referrers', value: JSON.stringify(refs) },
      }),
    ])
  } catch {
    // Never fail a page load for analytics
  }

  res.json({ ok: true })
}
