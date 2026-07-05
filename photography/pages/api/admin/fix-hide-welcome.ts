import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { readSiteConfig, writeSiteConfig } from '../../../lib/siteConfig'

// One-time: hides the welcome text block on the homepage. Remove after running.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.query.key !== 'hide-welcome-2026') return res.status(403).end()
  const config = await readSiteConfig()
  config.homepage.welcomeVisible = false
  await writeSiteConfig(config)
  res.json({ ok: true })
}
