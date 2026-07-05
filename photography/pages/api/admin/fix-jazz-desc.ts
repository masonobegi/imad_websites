import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

// One-time fix: update Jazz Festival description. Remove after running.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.query.key !== 'fix-jazz-2026') return res.status(403).end()

  await prisma.fineArtWork.update({
    where: { id: 'jazz-festival' },
    data: {
      description: "Leimert Park in Los Angeles has been the heartbeat of Black arts and culture on the West Coast for decades. This poster was created for the 5th Annual Leimert Park Jazz Festival's juried art competition — and took first place.\n\nThe design captures the energy and rhythm of an evening in the park, where live jazz moves through the crowd and the streets come alive. The color palette and composition draw from the vibrancy of the festival itself — bold, warm, and alive with movement.\n\nThe winning poster was featured in official festival materials and promotions throughout the 2024 season.",
      awardTitle: 'View the 2024 competition →',
      awardUrl: 'https://www.leimertparkjazzfestival.org/2024-art-competition',
    },
  })

  return res.json({ ok: true })
}
