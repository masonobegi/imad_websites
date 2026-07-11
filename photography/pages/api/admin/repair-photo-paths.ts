import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAdmin } from '../../../lib/admin'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return
  const { prisma } = await import('../../../lib/prisma')

  const photos = await prisma.photo.findMany()
  const results: { title: string; from: string; to: string; fixed: boolean }[] = []

  for (const photo of photos) {
    const expectedPath = `photos/${photo.category}/${photo.filename}`
    const existing = await prisma.uploadedImage.findUnique({ where: { path: expectedPath } })
    if (existing) continue // already correct

    // Find by filename under any photos/ path
    const found = await prisma.uploadedImage.findFirst({
      where: {
        AND: [
          { path: { startsWith: 'photos/' } },
          { path: { endsWith: `/${photo.filename}` } },
        ],
      },
    })

    if (found) {
      await prisma.uploadedImage.update({
        where: { path: found.path },
        data: { path: expectedPath },
      })
      results.push({ title: photo.title, from: found.path, to: expectedPath, fixed: true })
    } else {
      results.push({ title: photo.title, from: '(not found)', to: expectedPath, fixed: false })
    }
  }

  res.json({ repaired: results.filter(r => r.fixed).length, failed: results.filter(r => !r.fixed).length, results })
}
