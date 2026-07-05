import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

// One-time: copy the oil painting image to the jazz-festival digital slot.
// Remove after running.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.query.key !== 'fix-jazz-2026') return res.status(403).end()

  const oilImage = await prisma.uploadedImage.findFirst({
    where: { path: { contains: 'rhythms-of-leimert-park' } },
  })
  if (!oilImage) {
    const sample = await prisma.uploadedImage.findMany({ take: 5, select: { path: true } })
    return res.status(404).json({ error: 'Oil painting image not found', samplePaths: sample.map(s => s.path) })
  }

  await prisma.uploadedImage.upsert({
    where: { path: 'digital/jazz-festival.jpg' },
    update: { data: oilImage.data, mime: oilImage.mime },
    create: { path: 'digital/jazz-festival.jpg', data: oilImage.data, mime: oilImage.mime },
  })

  res.json({ ok: true })
}
