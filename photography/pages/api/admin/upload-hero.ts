import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export const config = { api: { bodyParser: { sizeLimit: '30mb' } } }

// One-time: upload a clean (non-watermarked) hero image.
// POST with JSON body: { key, id, base64 }
// id = photo ID (e.g. 'milky-way-over-joshua-tree'), base64 = JPEG data
// Remove after use.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { key, id, base64 } = req.body as { key: string; id: string; base64: string }
  if (key !== 'hero-upload-2026') return res.status(403).end()
  if (!id || !base64) return res.status(400).json({ error: 'Missing id or base64' })

  try {
    const sharp = require('sharp')
    const buffer = Buffer.from(base64, 'base64')
    const resized = await sharp(buffer, { limitInputPixels: false })
      .rotate()
      .resize({ width: 2400, withoutEnlargement: true })
      .jpeg({ quality: 88, mozjpeg: true })
      .toBuffer()

    const path = `hero/${id}.jpg`
    await prisma.uploadedImage.upsert({
      where: { path },
      update: { data: resized, mime: 'image/jpeg' },
      create: { path, data: resized, mime: 'image/jpeg' },
    })

    res.json({ ok: true, path, sizeKB: Math.round(resized.length / 1024) })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
}
