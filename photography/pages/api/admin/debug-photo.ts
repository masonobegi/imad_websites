import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAdmin } from '../../../lib/admin'
import { prisma } from '../../../lib/prisma'

// GET /api/admin/debug-photo?id=bufflehead-ballet
// Returns the Photo record and all matching UploadedImage paths
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return

  const { id } = req.query as { id?: string }

  if (id) {
    const photo = await prisma.photo.findUnique({ where: { id } })
    const images = await prisma.uploadedImage.findMany({
      where: { path: { contains: id.replace(/-/g, '') } },
      select: { path: true, mime: true },
    })
    // Also search by filename parts
    const filename = id + '.jpg'
    const byFilename = await prisma.uploadedImage.findMany({
      where: { path: { endsWith: filename } },
      select: { path: true, mime: true },
    })
    return res.json({ photo, imagesByIdSearch: images, imagesByFilename: byFilename })
  }

  // No id: list all photos with their expected vs actual UploadedImage state
  const photos = await prisma.photo.findMany({ orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }] })
  const results = await Promise.all(photos.map(async p => {
    const expectedPath = `photos/${p.category}/${p.filename}`
    const exact = await prisma.uploadedImage.findUnique({ where: { path: expectedPath } })
    const fallback = exact ? null : await prisma.uploadedImage.findFirst({
      where: { path: { startsWith: 'photos/', endsWith: p.filename } },
      select: { path: true },
    })
    return {
      id: p.id,
      title: p.title,
      category: p.category,
      filename: p.filename,
      expectedPath,
      exactMatch: !!exact,
      fallbackPath: fallback?.path ?? null,
      broken: !exact && !fallback,
    }
  }))

  res.json({
    total: results.length,
    broken: results.filter(r => r.broken),
    needsFallback: results.filter(r => !r.exactMatch && r.fallbackPath),
    ok: results.filter(r => r.exactMatch).length,
  })
}
