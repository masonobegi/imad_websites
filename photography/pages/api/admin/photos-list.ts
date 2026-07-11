import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAdmin } from '../../../lib/admin'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return
  const { prisma } = await import('../../../lib/prisma')
  const [photos, categories] = await Promise.all([
    prisma.photo.findMany({ orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }] }),
    prisma.photoCategory.findMany({ orderBy: { sortOrder: 'asc' } }),
  ])
  const photosByCategory: Record<string, typeof photos> = {}
  for (const p of photos) {
    if (!photosByCategory[p.category]) photosByCategory[p.category] = []
    photosByCategory[p.category].push(p)
  }
  const catMap: Record<string, { label: string; description: string }> = {}
  for (const c of categories) catMap[c.slug] = { label: c.label, description: c.description }
  res.json({ photos: photosByCategory, categories: catMap })
}
