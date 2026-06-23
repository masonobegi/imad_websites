import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

const DATA_DIR = process.env.DATA_DIR

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png', '.webp': 'image/webp',
  '.heic': 'image/heic', '.heif': 'image/heif',
  '.gif': 'image/gif',
}

// This route only handles images that live on the Railway Volume (DATA_DIR).
// Static images committed to git are served directly from public/ by Next.js.
// next.config.js rewrites use "fallback" mode, so this only fires when
// public/ doesn't have the file — i.e. it's a new admin-uploaded image.
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!DATA_DIR) return res.status(404).end()

  const segments = (req.query.path as string[]) || []
  const relative = segments.join('/')

  // Security: block any path traversal attempts
  const resolved = path.resolve(DATA_DIR, relative)
  if (!resolved.startsWith(path.resolve(DATA_DIR))) {
    return res.status(400).end()
  }

  if (!fs.existsSync(resolved)) return res.status(404).end()

  const ext = path.extname(resolved).toLowerCase()
  const contentType = MIME[ext]
  if (!contentType) return res.status(400).end()

  const stat = fs.statSync(resolved)
  res.setHeader('Content-Type', contentType)
  res.setHeader('Content-Length', stat.size)
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
  fs.createReadStream(resolved).pipe(res)
}
