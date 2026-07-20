import { NextApiRequest, NextApiResponse } from 'next'
import { requireAdmin } from '../../../lib/admin'
import { prisma } from '../../../lib/prisma'

function toHashtag(title: string): string {
  return '#' + title.split(/\W+/).filter(Boolean)
    .map(w => w[0].toUpperCase() + w.slice(1).toLowerCase()).join('')
}

const typeTagMap: Record<string, [string, string]> = {
  watercolor: ['#watercolor', '#watercolorpainting'],
  encaustic:  ['#encaustic', '#encausticart'],
  oil:        ['#pleinair', '#oilpainting'],
  photo:      ['#photography', '#fineartphotography'],
  sticker:    ['#sticker', '#stickerart'],
  digital:    ['#digitalart', '#logodesign'],
}

function generateTags(title: string, type: string): string[] {
  const [t1, t2] = typeTagMap[type] || ['#fineart', '#artwork']
  return ['#OBGillustrator', '#ImadObegi', t1, t2, toHashtag(title)]
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return

  if (req.method === 'GET') {
    const [fineArt, photos, stickers] = await Promise.all([
      prisma.fineArtWork.findMany({
        where: { type: { in: ['watercolor', 'encaustic', 'oil', 'digital'] } },
        select: { id: true, title: true, type: true, filename: true, tags: true },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.photo.findMany({
        select: { id: true, title: true, category: true, filename: true, tags: true },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.sticker.findMany({
        select: { id: true, filename: true, tags: true },
        orderBy: { sortOrder: 'asc' },
      }),
    ])
    return res.json([
      ...fineArt.map(w => ({ id: w.id, title: w.title, type: w.type, filename: w.filename, tags: w.tags })),
      ...photos.map(p => ({ id: p.id, title: p.title, type: 'photo', category: p.category, filename: p.filename, tags: p.tags })),
      ...stickers.map(s => ({
        id: s.id,
        title: s.filename.replace(/\.[^.]+$/, '').replace(/-/g, ' '),
        type: 'sticker',
        filename: s.filename,
        tags: s.tags,
      })),
    ])
  }

  if (req.method === 'POST') {
    const { action } = req.body as { action: string }

    if (action === 'generate-all') {
      const [fineArt, photos, stickers] = await Promise.all([
        prisma.fineArtWork.findMany({ where: { type: { in: ['watercolor', 'encaustic', 'oil', 'digital'] } } }),
        prisma.photo.findMany(),
        prisma.sticker.findMany(),
      ])
      await Promise.all([
        ...fineArt.map(w => prisma.fineArtWork.update({
          where: { id: w.id }, data: { tags: generateTags(w.title, w.type) },
        })),
        ...photos.map(p => prisma.photo.update({
          where: { id: p.id }, data: { tags: generateTags(p.title, 'photo') },
        })),
        ...stickers.map(s => prisma.sticker.update({
          where: { id: s.id },
          data: { tags: generateTags(s.filename.replace(/\.[^.]+$/, '').replace(/-/g, ' '), 'sticker') },
        })),
      ])
      return res.json({
        items: [
          ...fineArt.map(w => ({ id: w.id, title: w.title, type: w.type, filename: w.filename, tags: generateTags(w.title, w.type) })),
          ...photos.map(p => ({ id: p.id, title: p.title, type: 'photo', category: p.category, filename: p.filename, tags: generateTags(p.title, 'photo') })),
          ...stickers.map(s => ({
            id: s.id,
            title: s.filename.replace(/\.[^.]+$/, '').replace(/-/g, ' '),
            type: 'sticker',
            filename: s.filename,
            tags: generateTags(s.filename.replace(/\.[^.]+$/, '').replace(/-/g, ' '), 'sticker'),
          })),
        ],
      })
    }

    return res.status(400).json({ error: 'Unknown action' })
  }

  if (req.method === 'PUT') {
    const { type, id, tags } = req.body as { type: string; id: string; tags: string[] }
    if (!Array.isArray(tags)) return res.status(400).json({ error: 'tags must be array' })
    if (type === 'photo') {
      await prisma.photo.update({ where: { id }, data: { tags } })
    } else if (type === 'sticker') {
      await prisma.sticker.update({ where: { id }, data: { tags } })
    } else {
      await prisma.fineArtWork.update({ where: { id }, data: { tags } })
    }
    return res.json({ ok: true })
  }

  res.status(405).end()
}
