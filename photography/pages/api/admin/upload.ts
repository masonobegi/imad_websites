import { NextApiRequest, NextApiResponse } from 'next'
import path from 'path'
import { requireAdmin } from '../../../lib/admin'
import { prisma } from '../../../lib/prisma'

export const config = { api: { bodyParser: { sizeLimit: '20mb' } } }

function isValidImage(buf: Buffer): boolean {
  if (buf.length < 12) return false
  if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return true
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) return true
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
      buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) return true
  if (buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70) return true
  return false
}

function sanitizeFilename(name: string): string {
  const ext = path.extname(name).toLowerCase().replace(/[^.a-z0-9]/g, '')
  const base = path.basename(name, path.extname(name))
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return `${base || 'image'}${ext}`
}

function sanitizeCategory(cat: string): string {
  return cat.replace(/[^a-z0-9-]/gi, '').toLowerCase().slice(0, 50)
}

function buildWatermarkSvg(width: number, height: number): Buffer {
  const text = 'OBGillustrator'
  const fontSize = Math.max(14, Math.round(Math.min(width, height) / 28))
  const gap = fontSize * 5
  const extra = Math.max(width, height)
  const items: string[] = []
  for (let y = -extra; y < height + extra; y += gap) {
    for (let x = -extra; x < width + extra; x += gap * 3) {
      items.push(`<text x="${x}" y="${y}" fill="rgba(255,255,255,0.45)" font-size="${fontSize}" font-family="Arial,sans-serif">${text}</text>`)
    }
  }
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><g transform="rotate(-35 ${width / 2} ${height / 2})">${items.join('')}</g></svg>`
  )
}

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'])

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return
  if (req.method !== 'POST') return res.status(405).end()

  const { type, base64, filename: rawFilename, category: rawCategory } = req.body as {
    type: string; base64: string; filename: string; category?: string
  }

  if (!base64 || !rawFilename) return res.status(400).json({ error: 'Missing base64 or filename' })

  const filename = sanitizeFilename(rawFilename)
  const category = sanitizeCategory(rawCategory || 'nature')
  const ext = path.extname(filename).toLowerCase()
  if (!ALLOWED_EXTENSIONS.has(ext)) return res.status(400).json({ error: 'Unsupported file type' })

  try {
    const buffer = Buffer.from(base64, 'base64')
    if (!isValidImage(buffer)) return res.status(400).json({ error: 'File does not appear to be a valid image' })

    const dirMap: Record<string, string> = {
      photo:          `photos/${category}`,
      watercolor:     'fine-art/watercolors',
      encaustic:      'fine-art/encaustics',
      oil:            'fine-art/oils',
      'oil-pleinair': 'fine-art/oils',
      sticker:        'stickers',
    }
    const relDir = dirMap[type]
    if (!relDir) return res.status(400).json({ error: 'Invalid type' })

    let finalBuffer = buffer
    const mime = ext === '.png' ? 'image/png' : 'image/jpeg'
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const sharp = require('sharp')
      const img = sharp(buffer)
      const meta = await img.metadata()
      const w = meta.width || 800
      const h = meta.height || 600
      const wm = buildWatermarkSvg(w, h)
      const composed = img.composite([{ input: wm }])
      finalBuffer = ext === '.png'
        ? await composed.png().toBuffer()
        : await composed.jpeg({ quality: 90 }).toBuffer()
    } catch {
      console.warn('Sharp unavailable, saving without watermark for:', filename)
    }

    // Store image in PostgreSQL — survives all redeploys, no volume or GitHub needed
    const imgPath = `${relDir}/${filename}`
    await prisma.uploadedImage.upsert({
      where: { path: imgPath },
      update: { data: finalBuffer, mime },
      create: { path: imgPath, data: finalBuffer, mime },
    })

    // Register sticker record so it appears in admin
    if (type === 'sticker') {
      const count = await prisma.sticker.count()
      await prisma.sticker.upsert({
        where: { filename },
        update: {},
        create: { filename, sortOrder: count },
      })
    }

    res.json({ ok: true, filename })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Upload failed' })
  }
}
