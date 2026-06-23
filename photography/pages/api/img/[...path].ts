import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const segments = req.query.path as string[]
  const imgPath = segments.join('/')

  try {
    const image = await prisma.uploadedImage.findUnique({ where: { path: imgPath } })
    if (!image) return res.status(404).end()

    res.setHeader('Content-Type', image.mime)
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    res.send(image.data)
  } catch {
    res.status(500).end()
  }
}
