import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'
import { requireAdmin } from '../../../lib/admin'
import { getDataPath, getDataDir } from '../../../lib/dataDir'

function fineArtPath()  { return getDataPath('fine-art/data.json') }
function photosPath()   { return getDataPath('photos/data.json') }
function configPath()   { return getDataPath('photos/config.json') }
function stickersDir()  { return getDataDir('stickers') }

function readJson(p: string) { return JSON.parse(fs.readFileSync(p, 'utf-8')) }
function writeJson(p: string, data: unknown) { fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf-8') }

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return

  if (req.method === 'GET') {
    try {
      const fineArt = readJson(fineArtPath())
      const photos = readJson(photosPath())
      const config = readJson(configPath())
      const stickers = fs.readdirSync(stickersDir())
        .filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f))
        .sort()
      res.json({ fineArt, photos, config, stickers })
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
        const config = readJson(configPath())
        config.printSizes = data.printSizes
        writeJson(configPath(), config)
        return res.json({ ok: true })
      }

      if (type === 'photo') {
        const photos = readJson(photosPath())
        const cat = category as string
        if (!photos.photos[cat]) photos.photos[cat] = []
        if (action === 'add') {
          photos.photos[cat].push(data)
        } else if (action === 'update') {
          const idx = photos.photos[cat].findIndex((p: { id: string }) => p.id === id)
          if (idx >= 0) photos.photos[cat][idx] = { ...photos.photos[cat][idx], ...data }
        } else if (action === 'delete') {
          photos.photos[cat] = photos.photos[cat].filter((p: { id: string }) => p.id !== id)
        } else if (action === 'reorder') {
          const ids = (data as { ids: string[] }).ids
          const byId = new Map((photos.photos[cat] as { id: string }[]).map(p => [p.id, p]))
          photos.photos[cat] = ids.map(i => byId.get(i)).filter(Boolean)
        }
        writeJson(photosPath(), photos)
        return res.json({ ok: true })
      }

      if (type === 'fineArt') {
        const fineArt = readJson(fineArtPath())
        const cat = category as string
        if (!fineArt.works[cat]) fineArt.works[cat] = []
        if (action === 'add') {
          fineArt.works[cat].push(data)
        } else if (action === 'update') {
          const idx = fineArt.works[cat].findIndex((w: { id: string }) => w.id === id)
          if (idx >= 0) fineArt.works[cat][idx] = { ...fineArt.works[cat][idx], ...data }
        } else if (action === 'delete') {
          fineArt.works[cat] = fineArt.works[cat].filter((w: { id: string }) => w.id !== id)
        } else if (action === 'reorder') {
          const ids = (data as { ids: string[] }).ids
          const byId = new Map((fineArt.works[cat] as { id: string }[]).map(w => [w.id, w]))
          fineArt.works[cat] = ids.map(i => byId.get(i)).filter(Boolean)
        }
        writeJson(fineArtPath(), fineArt)
        return res.json({ ok: true })
      }

      if (type === 'sticker' && action === 'delete') {
        const filePath = path.join(stickersDir(), id as string)
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
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
