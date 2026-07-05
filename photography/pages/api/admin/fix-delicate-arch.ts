import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

// One-time fix: move delicate-arch-at-dawn back to nature category.
// Remove this file after running.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.query.key !== 'fix-arch-2026') return res.status(403).end()

  const log: string[] = []
  const photoId = 'delicate-arch-at-dawn'

  const photo = await prisma.photo.findUnique({ where: { id: photoId } })
  if (!photo) return res.json({ ok: false, log: ['Photo not found'] })

  log.push(`Found photo: category=${photo.category}, filename=${photo.filename}`)

  // Move to nature, append at end
  const natureCount = await prisma.photo.count({ where: { category: 'nature' } })

  // Fix UploadedImage path if it exists under san-francisco or san-francisco-bay
  for (const oldCat of [photo.category, 'san-francisco-bay', 'san-francisco']) {
    const oldPath = `photos/${oldCat}/${photo.filename}`
    const updated = await prisma.uploadedImage.updateMany({
      where: { path: oldPath },
      data: { path: `photos/nature/${photo.filename}` },
    })
    if (updated.count > 0) log.push(`Renamed UploadedImage: ${oldPath} → photos/nature/${photo.filename}`)
  }

  await prisma.photo.update({
    where: { id: photoId },
    data: { category: 'nature', sortOrder: natureCount },
  })
  log.push(`Moved photo to nature (sortOrder ${natureCount})`)

  return res.json({ ok: true, log })
}
