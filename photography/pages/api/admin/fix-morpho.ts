import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

// One-time: move Blue Morpho's Secret Eyes photo to 'nature' category. Remove after running.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.query.key !== 'fix-morpho-2026') return res.status(403).end()

  const photo = await prisma.photo.findUnique({ where: { id: 'blue-morpho-s-secret-eyes' } })
  if (!photo) return res.status(404).json({ error: 'Photo record not found' })

  await prisma.photo.update({
    where: { id: 'blue-morpho-s-secret-eyes' },
    data: { category: 'nature' },
  })

  res.json({ ok: true, was: photo.category, now: 'nature' })
}
