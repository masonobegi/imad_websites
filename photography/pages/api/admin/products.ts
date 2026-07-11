import { NextApiRequest, NextApiResponse } from 'next'
import { requireAdmin } from '../../../lib/admin'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return

  if (req.method === 'GET') {
    try {
      const [watercolors, encaustics, oils, photos, categories, printSizes, stickers, processEntries] = await Promise.all([
        prisma.fineArtWork.findMany({ where: { type: 'watercolor' }, include: { pleinAirImages: { orderBy: { sortOrder: 'asc' } } }, orderBy: { sortOrder: 'asc' } }),
        prisma.fineArtWork.findMany({ where: { type: 'encaustic' }, include: { pleinAirImages: { orderBy: { sortOrder: 'asc' } } }, orderBy: { sortOrder: 'asc' } }),
        prisma.fineArtWork.findMany({ where: { type: 'oil' }, include: { pleinAirImages: { orderBy: { sortOrder: 'asc' } } }, orderBy: { sortOrder: 'asc' } }),
        prisma.photo.findMany({ orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }] }),
        prisma.photoCategory.findMany({ orderBy: { sortOrder: 'asc' } }),
        prisma.printSize.findMany({ orderBy: { sortOrder: 'asc' } }),
        prisma.sticker.findMany({ orderBy: { sortOrder: 'asc' } }),
        prisma.artProcess.findMany({ include: { images: { orderBy: { sortOrder: 'asc' } } }, orderBy: { sortOrder: 'asc' } }),
      ])

      const photosByCategory: Record<string, typeof photos> = {}
      for (const p of photos) {
        if (!photosByCategory[p.category]) photosByCategory[p.category] = []
        photosByCategory[p.category].push(p)
      }

      const photoCategoryMap: Record<string, { label: string; description: string }> = {}
      for (const c of categories) photoCategoryMap[c.slug] = { label: c.label, description: c.description }

      const oilsWithAward = oils.map(w => ({
        ...w,
        award: w.awardTitle ? { title: w.awardTitle, url: w.awardUrl || '' } : null,
        pleinAirImages: w.pleinAirImages,
      }))

      res.json({
        fineArt: {
          categories: {
            watercolors: { label: 'Watercolors', description: '' },
            encaustics: { label: 'Encaustics', description: '' },
            oils: { label: 'Oil Paintings', description: '' },
          },
          works: { watercolors, encaustics, oils: oilsWithAward },
        },
        photos: { categories: photoCategoryMap, photos: photosByCategory },
        config: { printSizes },
        stickers: stickers.map(s => s.filename),
        process: processEntries.map(e => ({ id: e.id, title: e.title, description: e.description, images: e.images.map(i => ({ id: i.id, filename: i.filename })) })),
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Failed to read product data' })
    }
    return
  }

  if (req.method === 'PUT') {
    const { type, action, data, category, id } = req.body
    try {
      if (type === 'printConfig') {
        const sizes = (data.printSizes as { label: string; price: number }[])
        await prisma.printSize.deleteMany()
        for (let i = 0; i < sizes.length; i++) {
          await prisma.printSize.create({ data: { label: sizes[i].label, price: sizes[i].price, sortOrder: i } })
        }
        return res.json({ ok: true })
      }

      if (type === 'photo') {
        if (action === 'add') {
          const count = await prisma.photo.count({ where: { category } })
          // Use upsert to avoid creating a duplicate if this id somehow already exists
          await prisma.photo.upsert({
            where: { id: data.id },
            create: { ...data, category, sortOrder: count },
            update: { ...data, category, sortOrder: count },
          })
        } else if (action === 'update' || action === 'edit') {
          const { id: _id, ...photoData } = data
          // If category changed, rename the UploadedImage path and reset sortOrder
          const oldPhoto = await prisma.photo.findUnique({ where: { id } })
          if (oldPhoto && oldPhoto.category !== photoData.category) {
            // Place at end of new category to avoid sortOrder collisions
            const newSortOrder = await prisma.photo.count({ where: { category: photoData.category } })
            photoData.sortOrder = newSortOrder

            const newPath = `photos/${photoData.category}/${oldPhoto.filename}`
            const exact = await prisma.uploadedImage.updateMany({
              where: { path: `photos/${oldPhoto.category}/${oldPhoto.filename}` },
              data: { path: newPath },
            })
            if (exact.count === 0) {
              // Exact path didn't match — search by filename anywhere under photos/
              await prisma.uploadedImage.updateMany({
                where: { path: { contains: `/${oldPhoto.filename}` } },
                data: { path: newPath },
              })
            }
          }
          await prisma.photo.update({ where: { id }, data: photoData })
        } else if (action === 'delete') {
          await prisma.photo.delete({ where: { id } })
        } else if (action === 'reorder') {
          const ids: string[] = data.ids
          await Promise.all(ids.map((pid, i) => prisma.photo.update({ where: { id: pid }, data: { sortOrder: i } })))
        }
        return res.json({ ok: true })
      }

      if (type === 'fineArt') {
        const typeMap: Record<string, string> = { watercolors: 'watercolor', encaustics: 'encaustic', oils: 'oil', digitals: 'digital' }
        const artType = typeMap[category] || category
        if (action === 'add') {
          const count = await prisma.fineArtWork.count({ where: { type: artType } })
          const { pleinAirImages, award, ...rest } = data
          await prisma.fineArtWork.create({
            data: {
              ...rest,
              type: artType,
              sortOrder: count,
              awardTitle: award?.title ?? null,
              awardUrl: award?.url ?? null,
              pleinAirImages: pleinAirImages?.length
                ? { create: pleinAirImages.map((p: { id: string; filename: string; title: string }, i: number) => ({ ...p, sortOrder: i })) }
                : undefined,
            },
          })
        } else if (action === 'update' || action === 'edit') {
          const { pleinAirImages, award, id: _id, ...rest } = data
          await prisma.fineArtWork.update({
            where: { id },
            data: {
              ...rest,
              awardTitle: award?.title ?? null,
              awardUrl: award?.url ?? null,
            },
          })
          // Sync process/plein-air images when provided
          if (Array.isArray(pleinAirImages)) {
            await prisma.pleinAirImage.deleteMany({ where: { workId: id } })
            if (pleinAirImages.length > 0) {
              await prisma.pleinAirImage.createMany({
                data: pleinAirImages.map((p: { id: string; filename: string; title: string }, i: number) => ({
                  id: p.id, filename: p.filename, title: p.title, sortOrder: i, workId: id,
                })),
              })
            }
          }
        } else if (action === 'delete') {
          await prisma.fineArtWork.delete({ where: { id } })
        } else if (action === 'reorder') {
          const ids: string[] = data.ids
          await Promise.all(ids.map((wid, i) => prisma.fineArtWork.update({ where: { id: wid }, data: { sortOrder: i } })))
        }
        return res.json({ ok: true })
      }

      if (type === 'photoCategory') {
        if (action === 'add') {
          const count = await prisma.photoCategory.count()
          await prisma.photoCategory.create({ data: { slug: data.slug, label: data.label, description: data.description || '', sortOrder: count } })
        } else if (action === 'delete') {
          const photoCount = await prisma.photo.count({ where: { category: id } })
          if (photoCount > 0) return res.status(400).json({ error: 'Category still has photos — remove them first' })
          await prisma.photoCategory.delete({ where: { slug: id } })
        }
        return res.json({ ok: true })
      }

      if (type === 'sticker') {
        if (action === 'delete') {
          await prisma.sticker.deleteMany({ where: { filename: id } })
        } else if (action === 'reorder') {
          const filenames: string[] = data.ids
          await Promise.all(filenames.map((fn, i) => prisma.sticker.update({ where: { filename: fn }, data: { sortOrder: i } })))
        }
        return res.json({ ok: true })
      }

      if (type === 'artProcess') {
        if (action === 'add') {
          const count = await prisma.artProcess.count()
          const { images, ...rest } = data
          await prisma.artProcess.create({
            data: {
              ...rest,
              sortOrder: count,
              images: images?.length
                ? { create: images.map((img: { id: string; filename: string }, i: number) => ({ id: img.id, filename: img.filename, sortOrder: i })) }
                : undefined,
            },
          })
        } else if (action === 'update' || action === 'edit') {
          const { images, id: _id, ...rest } = data
          await prisma.artProcess.update({ where: { id }, data: rest })
          if (Array.isArray(images)) {
            await prisma.artProcessImage.deleteMany({ where: { processId: id } })
            if (images.length > 0) {
              await prisma.artProcessImage.createMany({
                data: images.map((img: { id: string; filename: string }, i: number) => ({
                  id: img.id, filename: img.filename, sortOrder: i, processId: id,
                })),
              })
            }
          }
        } else if (action === 'delete') {
          await prisma.artProcess.delete({ where: { id } })
        } else if (action === 'reorder') {
          const ids: string[] = data.ids
          await Promise.all(ids.map((eid, i) => prisma.artProcess.update({ where: { id: eid }, data: { sortOrder: i } })))
        }
        return res.json({ ok: true })
      }

      res.status(400).json({ error: 'Invalid request' })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Failed to update data' })
    }
    return
  }

  res.status(405).end()
}
