import { GetServerSideProps } from 'next'

const BASE = 'https://obgillustrator.com'

const STATIC_PAGES = [
  { url: '/', priority: '1.0' },
  { url: '/shop', priority: '0.9' },
  { url: '/fine-art', priority: '0.9' },
  { url: '/fine-art/watercolors?v=5', priority: '0.8' },
  { url: '/fine-art/encaustics?v=5', priority: '0.8' },
  { url: '/fine-art/oils?v=5', priority: '0.8' },
  { url: '/stickers', priority: '0.7' },
  { url: '/about', priority: '0.6' },
  { url: '/contact', priority: '0.6' },
  { url: '/commissions', priority: '0.7' },
  { url: '/photos/nature?v=5', priority: '0.8' },
  { url: '/photos/san-francisco?v=5', priority: '0.8' },
  { url: '/privacy', priority: '0.3' },
  { url: '/tos', priority: '0.3' },
]

function SitemapPage() { return null }
export default SitemapPage

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const { prisma } = await import('../lib/prisma')
  const photos = await prisma.photo.findMany({ select: { id: true, category: true } })
  const photoUrls = photos.map(p => ({ url: `/photos/${p.category}/${p.id}?v=5`, priority: '0.7' }))

  const allUrls = [...STATIC_PAGES, ...photoUrls]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(p => `  <url>
    <loc>${BASE}${p.url}</loc>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  res.setHeader('Content-Type', 'application/xml')
  res.write(xml)
  res.end()

  return { props: {} }
}
