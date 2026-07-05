import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

// One-time cleanup: merges san-francisco-bay (1 photo) into san-francisco (11 photos)
// Hit once then this file is deleted on the next deploy.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.query.key !== 'fix-sf-dup-2026-7') return res.status(403).end()

  const dupSlug = 'san-francisco-bay'
  const mainSlug = 'san-francisco'

  const photos = await prisma.photo.findMany({ where: { category: dupSlug } })
  if (photos.length === 0) {
    await prisma.photoCategory.deleteMany({ where: { slug: dupSlug } })
    return res.json({ ok: true, moved: 0, message: 'Duplicate was already empty — deleted it.' })
  }

  // Move all photos from duplicate → main category, preserving sort order
  const existingCount = await prisma.photo.count({ where: { category: mainSlug } })
  for (let i = 0; i < photos.length; i++) {
    await prisma.photo.update({
      where: { id: photos[i].id },
      data: { category: mainSlug, sortOrder: existingCount + i },
    })
    // Rename the UploadedImage path so the image keeps working
    const oldPath = `photos/${dupSlug}/${photos[i].filename}`
    const newPath = `photos/${mainSlug}/${photos[i].filename}`
    await prisma.uploadedImage.updateMany({ where: { path: oldPath }, data: { path: newPath } })
  }

  await prisma.photoCategory.deleteMany({ where: { slug: dupSlug } })
  return res.json({ ok: true, moved: photos.length, message: `Moved ${photos.length} photo(s) from ${dupSlug} to ${mainSlug} and deleted duplicate category.` })
}
