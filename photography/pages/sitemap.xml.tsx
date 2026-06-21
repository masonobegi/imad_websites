import { GetServerSideProps } from 'next'
import fs from 'fs'
import path from 'path'

const BASE = 'https://obgillustrator.com'

const STATIC_PAGES = [
  { url: '/', priority: '1.0' },
  { url: '/shop', priority: '0.9' },
  { url: '/fine-art', priority: '0.9' },
  { url: '/fine-art/watercolors', priority: '0.8' },
  { url: '/fine-art/encaustics', priority: '0.8' },
  { url: '/fine-art/oils', priority: '0.8' },
  { url: '/stickers', priority: '0.7' },
  { url: '/about', priority: '0.6' },
  { url: '/contact', priority: '0.6' },
  { url: '/commissions', priority: '0.7' },
  { url: '/photos/nature', priority: '0.8' },
  { url: '/photos/san-francisco', priority: '0.8' },
  { url: '/privacy', priority: '0.3' },
  { url: '/tos', priority: '0.3' },
]

function SitemapPage() { return null }
export default SitemapPage

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const photosData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public', 'photos', 'data.json'), 'utf-8'))
  const photoUrls = Object.entries(photosData.photos as Record<string, { id: string }[]>)
    .flatMap(([cat, photos]) => photos.map(p => ({ url: `/photos/${cat}/${p.id}`, priority: '0.7' })))

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
