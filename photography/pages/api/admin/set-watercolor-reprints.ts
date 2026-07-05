import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

// One-time: set all watercolors to reprintAvailable=true, reprintMedium='Archival paper', reprintPrice=100
// Remove after running.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.query.key !== 'watercolor-reprints-2026') return res.status(403).end()

  const result = await prisma.fineArtWork.updateMany({
    where: { type: 'watercolor' },
    data: { reprintAvailable: true, reprintMedium: 'Archival paper', reprintPrice: 100 },
  })

  res.json({ ok: true, updated: result.count })
}
