import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const segments = req.query.path as string[]
  const imgPath = segments.join('/')

  try {
    let image = await prisma.uploadedImage.findUnique({ where: { path: imgPath } })

    // For photos, if the exact path isn't found (category may have changed),
    // fall back to searching by filename under any photos/ prefix
    if (!image && imgPath.startsWith('photos/')) {
      const filename = imgPath.split('/').pop()
      if (filename) {
        image = await prisma.uploadedImage.findFirst({
          where: { path: { startsWith: 'photos/', endsWith: filename } },
        })
      }
    }

    if (!image) return res.status(404).end()

    res.setHeader('Content-Type', image.mime)
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    res.send(image.data)
  } catch {
    res.status(500).end()
  }
}
