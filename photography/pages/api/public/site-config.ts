import { NextApiRequest, NextApiResponse } from 'next'
import { readSiteConfig } from '../../../lib/siteConfig'

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60')
  res.json(await readSiteConfig())
}
