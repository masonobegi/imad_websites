import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

// One-time cleanup route. Remove after running.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.query.key !== 'fix-sf-dup-2026-7') return res.status(403).end()

  const log: string[] = []

  // ── 1. Merge duplicate photo category ────────────────────────────────────
  const dupSlug = 'san-francisco-bay'
  const mainSlug = 'san-francisco'

  const dupPhotos = await prisma.photo.findMany({ where: { category: dupSlug } })
  if (dupPhotos.length > 0) {
    const existingCount = await prisma.photo.count({ where: { category: mainSlug } })
    for (let i = 0; i < dupPhotos.length; i++) {
      await prisma.photo.update({
        where: { id: dupPhotos[i].id },
        data: { category: mainSlug, sortOrder: existingCount + i },
      })
      const oldPath = `photos/${dupSlug}/${dupPhotos[i].filename}`
      const newPath = `photos/${mainSlug}/${dupPhotos[i].filename}`
      await prisma.uploadedImage.updateMany({ where: { path: oldPath }, data: { path: newPath } })
    }
    log.push(`Moved ${dupPhotos.length} photo(s) from ${dupSlug} → ${mainSlug}`)
  }
  const deleted = await prisma.photoCategory.deleteMany({ where: { slug: dupSlug } })
  if (deleted.count > 0) log.push(`Deleted duplicate category: ${dupSlug}`)

  // ── 2. Pin san-francisco-panoramic encaustic to sortOrder 0 ──────────────
  const sfEncId = 'san-francisco-panoramic'
  const allEnc = await prisma.fineArtWork.findMany({
    where: { type: 'encaustic' },
    orderBy: { sortOrder: 'asc' },
  })
  const sfEnc = allEnc.find(e => e.id === sfEncId)
  if (sfEnc) {
    const reordered = [sfEnc, ...allEnc.filter(e => e.id !== sfEncId)]
    await Promise.all(reordered.map((e, i) =>
      prisma.fineArtWork.update({ where: { id: e.id }, data: { sortOrder: i } })
    ))
    log.push(`Pinned ${sfEncId} to top of encaustics (sortOrder 0)`)
  } else {
    log.push(`WARNING: ${sfEncId} not found in DB`)
  }

  return res.json({ ok: true, log })
}
