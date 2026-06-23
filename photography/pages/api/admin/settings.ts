import { NextApiRequest, NextApiResponse } from 'next'
import { requireAdmin } from '../../../lib/admin'
import { readSiteConfig, writeSiteConfig, SiteConfig } from '../../../lib/siteConfig'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return

  if (req.method === 'GET') {
    return res.json(await readSiteConfig())
  }

  if (req.method === 'PUT') {
    try {
      await writeSiteConfig(req.body as SiteConfig)
      return res.json({ ok: true })
    } catch (err) {
      console.error('Settings write error:', err)
      return res.status(500).json({ error: 'Failed to save settings' })
    }
  }

  res.status(405).end()
}
