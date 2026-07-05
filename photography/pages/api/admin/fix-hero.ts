import { NextApiRequest, NextApiResponse } from 'next'
import { readSiteConfig, writeSiteConfig } from '../../../lib/siteConfig'

// One-time: set heroPhotoId back to milky-way-over-joshua-tree. Remove after running.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.query.key !== 'fix-hero-2026') return res.status(403).end()
  const config = await readSiteConfig()
  config.homepage.heroPhotoId = 'milky-way-over-joshua-tree'
  await writeSiteConfig(config)
  res.json({ ok: true, heroPhotoId: config.homepage.heroPhotoId })
}
