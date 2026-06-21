import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'
import { requireAdmin } from '../../../lib/admin'

export const config = { api: { bodyParser: { sizeLimit: '20mb' } } }

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return
  if (req.method !== 'POST') return res.status(405).end()

  const { type, base64, filename, category } = req.body as {
    type: string
    base64: string
    filename: string
    category?: string
  }

  if (!base64 || !filename) return res.status(400).json({ error: 'Missing base64 or filename' })

  try {
    const buffer = Buffer.from(base64, 'base64')
    const ext = path.extname(filename).toLowerCase()
    const isPng = ext === '.png'

    const dirMap: Record<string, string> = {
      photo: path.join(process.cwd(), 'public', 'photos', category || 'nature'),
      watercolor: path.join(process.cwd(), 'public', 'fine-art', 'watercolors'),
      encaustic: path.join(process.cwd(), 'public', 'fine-art', 'encaustics'),
      oil: path.join(process.cwd(), 'public', 'fine-art', 'oils'),
      'oil-pleinair': path.join(process.cwd(), 'public', 'fine-art', 'oils'),
      sticker: path.join(process.cwd(), 'public', 'stickers'),
    }

    const destDir = dirMap[type]
    if (!destDir) return res.status(400).json({ error: 'Invalid type' })
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true })

    let finalBuffer = buffer
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const sharp = require('sharp')
      const img = sharp(buffer)
      const meta = await img.metadata()
      const w = meta.width || 800
      const h = meta.height || 600
      const wm = buildWatermarkSvg(w, h)
      const composed = img.composite([{ input: wm }])
      finalBuffer = isPng
        ? await composed.png().toBuffer()
        : await composed.jpeg({ quality: 90 }).toBuffer()
    } catch {
      // Sharp not installed yet — save original without watermark
      console.warn('Sharp unavailable, saving without watermark for:', filename)
    }

    fs.writeFileSync(path.join(destDir, filename), finalBuffer)
    res.json({ ok: true, filename })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Upload failed' })
  }
}
