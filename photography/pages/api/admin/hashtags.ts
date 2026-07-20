import { NextApiRequest, NextApiResponse } from 'next'
import { requireAdmin } from '../../../lib/admin'
import { prisma } from '../../../lib/prisma'

function toHashtag(title: string): string {
  return '#' + title.split(/\W+/).filter(Boolean)
    .map(w => w[0].toUpperCase() + w.slice(1).toLowerCase()).join('')
}

// Subject detection: checked against title + description combined
const subjectPatterns: [RegExp, string][] = [
  [/moon|lunar|night sky|celestial|moonlit/i, '#moonart'],
  [/ocean|sea|waves|beach|shore|coastal|tide|surf|seaside/i, '#coastalpainting'],
  [/mountain|hill|valley|peak|summit|ridge|sierra|alpine/i, '#mountainpainting'],
  [/harbor|boat|sailboat|marina|pier|dock|nautical/i, '#harborscene'],
  [/landscape|countryside|rural|scenic|vista|meadow|field/i, '#landscapepainting'],
  [/flower|floral|bloom|botanical|garden|rose|lily|petal|blossom/i, '#floralpainting'],
  [/portrait|figure|person|face|woman|man|people|human|body/i, '#portraiture'],
  [/jazz|music|musician|concert|festival|band|rhythm|blues|soul/i, '#musicart'],
  [/california|san francisco|bay area|los angeles|pacific coast|leimert|venice|marin/i, '#californiaart'],
  [/abstract|geometric|texture|pattern|form|shape/i, '#abstractart'],
  [/sunset|sunrise|golden hour|dusk|dawn|twilight|golden light/i, '#goldenhoursart'],
  [/fog|mist|misty|rainy|storm|overcast|atmospheric/i, '#atmosphericpainting'],
  [/forest|trees|woodland|woods|redwoods|pine|oak|eucalyptus/i, '#forestpainting'],
  [/city|urban|street|building|architecture|downtown|skyline/i, '#urbanpainting'],
  [/lake|river|pond|creek|stream|reflection|still water|wetland/i, '#waterscape'],
  [/desert|canyon|mesa|arid|dry|southwest|Joshua|mojave/i, '#desertart'],
  [/bird|birds|wildlife|animal|creature|hummingbird|heron|pelican/i, '#wildlifepainting'],
  [/plein air|outdoor|en plein|location|site|park/i, '#pleinairpainting'],
]

// Medium-specific community hashtags
const mediumTag: Record<string, string> = {
  watercolor: '#watercolorpainting',
  encaustic:  '#encausticpainting',
  oil:        '#oilpainting',
  photo:      '#fineartphotography',
  sticker:    '#stickerdesign',
  digital:    '#digitalillustration',
}

// Hashtag that signals the work is available to buy/collect
const marketTag: Record<string, string> = {
  watercolor: '#artforsale',
  encaustic:  '#artforsale',
  oil:        '#originalpainting',
  photo:      '#artprint',
  sticker:    '#stickershop',
  digital:    '#commissionsopen',
}

function generateTags(title: string, description: string, type: string): string[] {
  const combined = title + ' ' + (description || '')
  const tags: string[] = ['#OBGillustrator']

  // Always include the piece's own title as a hashtag
  tags.push(toHashtag(title))

  // Subject detection — first pattern that matches wins
  for (const [pattern, tag] of subjectPatterns) {
    if (pattern.test(combined) && !tags.includes(tag)) {
      tags.push(tag)
      break
    }
  }

  // Medium tag
  const med = mediumTag[type]
  if (med && !tags.includes(med)) tags.push(med)

  // Market/action tag
  const mkt = marketTag[type]
  if (mkt && !tags.includes(mkt)) tags.push(mkt)

  // Fallback fillers if still under 5
  const fillers = ['#fineart', '#originalart', '#artofinstagram', '#handmade', '#artwork']
  for (const f of fillers) {
    if (tags.length >= 5) break
    if (!tags.includes(f)) tags.push(f)
  }

  return tags.slice(0, 5)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return

  if (req.method === 'GET') {
    const [fineArt, photos, stickers] = await Promise.all([
      prisma.fineArtWork.findMany({
        where: { type: { in: ['watercolor', 'encaustic', 'oil', 'digital'] } },
        select: { id: true, title: true, description: true, type: true, filename: true, tags: true },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.photo.findMany({
        select: { id: true, title: true, description: true, category: true, filename: true, tags: true },
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

      const fineArtTags = fineArt.map(w => ({ ...w, newTags: generateTags(w.title, w.description, w.type) }))
      const photoTags   = photos.map(p => ({ ...p, newTags: generateTags(p.title, p.description, 'photo') }))
      const stickerTags = stickers.map(s => ({
        ...s,
        derivedTitle: s.filename.replace(/\.[^.]+$/, '').replace(/-/g, ' '),
        newTags: generateTags(s.filename.replace(/\.[^.]+$/, '').replace(/-/g, ' '), '', 'sticker'),
      }))

      await Promise.all([
        ...fineArtTags.map(w => prisma.fineArtWork.update({ where: { id: w.id }, data: { tags: w.newTags } })),
        ...photoTags.map(p => prisma.photo.update({ where: { id: p.id }, data: { tags: p.newTags } })),
        ...stickerTags.map(s => prisma.sticker.update({ where: { id: s.id }, data: { tags: s.newTags } })),
      ])

      return res.json({
        items: [
          ...fineArtTags.map(w => ({ id: w.id, title: w.title, type: w.type, filename: w.filename, tags: w.newTags })),
          ...photoTags.map(p => ({ id: p.id, title: p.title, type: 'photo', category: p.category, filename: p.filename, tags: p.newTags })),
          ...stickerTags.map(s => ({ id: s.id, title: s.derivedTitle, type: 'sticker', filename: s.filename, tags: s.newTags })),
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
