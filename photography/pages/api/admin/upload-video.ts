import { NextApiRequest, NextApiResponse } from 'next'
import path from 'path'
import { requireAdmin } from '../../../lib/admin'
import { prisma } from '../../../lib/prisma'

export const config = { api: { bodyParser: { sizeLimit: '150mb' } } }

const VIDEO_EXTS = new Set(['.mp4', '.mov', '.webm', '.m4v'])
const VIDEO_MIMES: Record<string, string> = {
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.webm': 'video/webm',
  '.m4v': 'video/mp4',
}

function sanitizeFilename(name: string): string {
  const ext = path.extname(name).toLowerCase().replace(/[^.a-z0-9]/g, '')
  const base = path.basename(name, path.extname(name))
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return `${base || 'video'}${ext}`
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return
  if (req.method !== 'POST') return res.status(405).end()

  const { base64, filename: rawFilename, folder } = req.body as {
    base64: string; filename: string; folder: string
  }

  if (!base64 || !rawFilename || !folder) {
    return res.status(400).json({ error: 'Missing base64, filename, or folder' })
  }

  const filename = sanitizeFilename(rawFilename)
  const ext = path.extname(filename).toLowerCase()

  if (!VIDEO_EXTS.has(ext)) {
    return res.status(400).json({ error: 'Unsupported video type — use mp4, mov, webm, or m4v' })
  }

  const allowedFolders = ['fine-art/watercolors', 'fine-art/encaustics', 'fine-art/oils']
  const safeFolder = folder.replace(/[^a-z0-9/-]/g, '')
  if (!allowedFolders.includes(safeFolder)) {
    return res.status(400).json({ error: 'Invalid folder' })
  }

  try {
    const buffer = Buffer.from(base64, 'base64')
    const mime = VIDEO_MIMES[ext] || 'video/mp4'
    const imgPath = `${safeFolder}/${filename}`

    await prisma.uploadedImage.upsert({
      where: { path: imgPath },
      update: { data: buffer, mime },
      create: { path: imgPath, data: buffer, mime },
    })

    res.json({ ok: true, filename })
  } catch (err) {
    console.error('Video upload error:', err)
    res.status(500).json({ error: 'Video upload failed' })
  }
}
