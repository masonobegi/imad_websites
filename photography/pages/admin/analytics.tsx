import Head from 'next/head'
import { GetServerSideProps } from 'next'
import AdminLayout from '../../components/AdminLayout'
import { checkAdminCookie } from '../../lib/admin'

interface PageStat { path: string; views: number }
interface Props { stats: PageStat[]; total: number }

const PAGE_NAMES: Record<string, string> = {
  '/': 'Home',
  '/photography': 'Photography',
  '/fine-art': 'Fine Art',
  '/fine-art/watercolors': 'Watercolors',
  '/fine-art/encaustics': 'Encaustics',
  '/fine-art/oils': 'Oil Paintings',
  '/digital': 'Digital Design',
  '/stickers': 'Stickers',
  '/commissions': 'Commissions',
  '/about': 'About',
}

export default function AdminAnalytics({ stats, total }: Props) {
  const maxViews = stats[0]?.views || 1

  return (
    <AdminLayout>
      <Head><title>Analytics | Admin</title></Head>
      <div className="px-6 py-8 max-w-3xl">
        <h1 className="text-2xl font-semibold text-ink mb-1">Site Analytics</h1>
        <p className="text-mist text-sm mb-8">Page views tracked since analytics was enabled. Each page load counts once.</p>

        <div className="bg-white rounded-xl border border-edge p-6 mb-6 inline-block">
          <p className="text-xs text-mist uppercase tracking-widest mb-1">Total Page Views</p>
          <p className="font-serif text-4xl text-ink">{total.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-xl border border-edge overflow-hidden">
          <div className="px-5 py-3 border-b border-edge flex justify-between text-[11px] text-mist uppercase tracking-widest">
            <span>Page</span>
            <span>Views</span>
          </div>
          {stats.length === 0 ? (
            <p className="px-5 py-8 text-mist text-sm text-center">
              No data yet — views will appear here as visitors browse the site.
            </p>
          ) : (
            stats.map(stat => (
              <div key={stat.path} className="px-5 py-3 border-b border-edge last:border-0 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink truncate">{PAGE_NAMES[stat.path] || stat.path}</p>
                  <p className="text-[11px] text-mist truncate">{stat.path}</p>
                </div>
                <div className="w-28 h-1.5 bg-edge rounded-full overflow-hidden flex-shrink-0">
                  <div
                    className="h-full bg-copper rounded-full transition-all"
                    style={{ width: `${Math.round((stat.views / maxViews) * 100)}%` }}
                  />
                </div>
                <span className="text-sm text-ink w-12 text-right flex-shrink-0">
                  {stat.views.toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  if (!checkAdminCookie(req.headers.cookie || '')) {
    return { redirect: { destination: '/admin/login', permanent: false } }
  }

  const { prisma } = await import('../../lib/prisma')
  const row = await prisma.siteConfig.findUnique({ where: { key: 'pageviews' } })
  const data: Record<string, number> = row ? JSON.parse(row.value) : {}

  const stats = Object.entries(data)
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 40)

  const total = Object.values(data).reduce((s, v) => s + v, 0)

  return { props: { stats, total } }
}
