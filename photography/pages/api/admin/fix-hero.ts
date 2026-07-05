import { NextApiRequest, NextApiResponse } from 'next'
import { readSiteConfig, writeSiteConfig } from '../../../lib/siteConfig'

// One-time: restore hero photo to delicate-arch-at-dawn. Remove after running.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.query.key !== 'fix-hero-2026') return res.status(403).end()
  const config = await readSiteConfig()
  config.homepage.heroPhotoId = 'delicate-arch-at-dawn'
  await writeSiteConfig(config)
  res.json({ ok: true })
}
