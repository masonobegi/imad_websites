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
          where: { path: { contains: `/${filename}` } },
        })
      }
    }

    if (!image) return res.status(404).end()

    // ETag based on last-updated timestamp — browsers revalidate automatically
    // when an image is re-uploaded, without needing to clear cache manually.
    const etag = `"${image.updatedAt.getTime()}"`
    if (req.headers['if-none-match'] === etag) return res.status(304).end()

    res.setHeader('Content-Type', image.mime)
    res.setHeader('Cache-Control', 'public, max-age=31536000')
    res.setHeader('ETag', etag)
    res.send(image.data)
  } catch {
    res.status(500).end()
  }
}
