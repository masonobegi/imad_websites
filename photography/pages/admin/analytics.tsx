import Head from 'next/head'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { checkAdminCookie } from '../../lib/admin'

interface PageStat { path: string; views: number }
interface DayStat { date: string; label: string; views: number }
interface RefStat { domain: string; count: number }

interface Props {
  stats: PageStat[]
  total: number
  todayViews: number
  weekViews: number
  monthViews: number
  last30: DayStat[]
  referrers: RefStat[]
}

const PAGE_NAMES: Record<string, string> = {
  '/': 'Home',
  '/photography': 'Photography',
  '/photography/nature': 'Photography — Nature',
  '/photography/san-francisco': 'Photography — San Francisco Bay',
  '/fine-art': 'Fine Art',
  '/fine-art/watercolors?v=3': 'Watercolors',
  '/fine-art/encaustics?v=3': 'Encaustics',
  '/fine-art/oils?v=3': 'Oil Paintings',
  '/digital': 'Digital Design',
  '/stickers': 'Stickers',
  '/commissions': 'Commissions',
  '/about': 'About',
  '/contact': 'Contact',
  '/process': 'The Process',
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-edge p-5">
      <p className="text-xs text-mist uppercase tracking-widest mb-1">{label}</p>
      <p className="font-serif text-3xl text-ink">{value.toLocaleString()}</p>
    </div>
  )
}

export default function AdminAnalytics({ stats, total, todayViews, weekViews, monthViews, last30, referrers }: Props) {
  const maxViews = stats[0]?.views || 1
  const maxDay = last30.reduce((m, d) => Math.max(m, d.views), 1)
  const maxRef = referrers[0]?.count || 1
  const router = useRouter()
  const [resetting, setResetting] = useState(false)

  async function handleReset() {
    if (!confirm('Reset all analytics data? This cannot be undone.')) return
    setResetting(true)
    await fetch('/api/admin/reset-analytics', { method: 'POST' })
    router.replace(router.asPath)
    setResetting(false)
  }

  return (
    <AdminLayout>
      <Head><title>Analytics | Admin</title></Head>
      <div className="px-6 py-8 max-w-4xl">
        <div className="flex items-start justify-between mb-1">
          <h1 className="text-2xl font-semibold text-ink">Site Analytics</h1>
          <button
            onClick={handleReset}
            disabled={resetting}
            className="text-xs text-mist hover:text-red-500 transition-colors disabled:opacity-40"
          >
            {resetting ? 'Resetting…' : 'Reset all data'}
          </button>
        </div>
        <p className="text-mist text-sm mb-8">Server-side page view tracking — no cookies, no external scripts.</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatTile label="All Time" value={total} />
          <StatTile label="This Month" value={monthViews} />
          <StatTile label="This Week" value={weekViews} />
          <StatTile label="Today" value={todayViews} />
        </div>

        <div className="bg-white rounded-xl border border-edge p-5 mb-6">
          <p className="text-xs text-mist uppercase tracking-widest mb-4">Last 30 Days</p>
          <div className="flex items-end gap-0.5 h-24">
            {last30.map(day => (
              <div
                key={day.date}
                className="flex-1 bg-copper/50 hover:bg-copper transition-colors rounded-t cursor-default"
                style={{ height: `${Math.max(2, Math.round((day.views / maxDay) * 100))}%` }}
                title={`${day.label}: ${day.views} view${day.views !== 1 ? 's' : ''}`}
              />
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-mist mt-2">
            <span>{last30[0]?.label}</span>
            <span>{last30[14]?.label}</span>
            <span>{last30[29]?.label}</span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-edge overflow-hidden">
            <div className="px-5 py-3 border-b border-edge flex justify-between text-[11px] text-mist uppercase tracking-widest">
              <span>Page</span>
              <span>All-time views</span>
            </div>
            {stats.length === 0 ? (
              <p className="px-5 py-8 text-mist text-sm text-center">No data yet — views appear as visitors browse.</p>
            ) : (
              stats.map(stat => (
                <div key={stat.path} className="px-5 py-3 border-b border-edge last:border-0 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink truncate">{PAGE_NAMES[stat.path] || stat.path}</p>
                    <p className="text-[11px] text-mist truncate">{stat.path}</p>
                  </div>
                  <div className="w-20 h-1.5 bg-edge rounded-full overflow-hidden flex-shrink-0">
                    <div className="h-full bg-copper rounded-full" style={{ width: `${Math.round((stat.views / maxViews) * 100)}%` }} />
                  </div>
                  <span className="text-sm text-ink w-10 text-right flex-shrink-0">{stat.views.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>

          <div className="bg-white rounded-xl border border-edge overflow-hidden">
            <div className="px-5 py-3 border-b border-edge flex justify-between text-[11px] text-mist uppercase tracking-widest">
              <span>Referrer</span>
              <span>Visits</span>
            </div>
            {referrers.length === 0 ? (
              <p className="px-5 py-8 text-mist text-sm text-center">No referrer data yet.</p>
            ) : (
              referrers.map(ref => (
                <div key={ref.domain} className="px-5 py-3 border-b border-edge last:border-0 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink truncate">{ref.domain === 'direct' ? 'Direct / Unknown' : ref.domain}</p>
                  </div>
                  <div className="w-20 h-1.5 bg-edge rounded-full overflow-hidden flex-shrink-0">
                    <div className="h-full bg-copper rounded-full" style={{ width: `${Math.round((ref.count / maxRef) * 100)}%` }} />
                  </div>
                  <span className="text-sm text-ink w-10 text-right flex-shrink-0">{ref.count.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
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

  const [pvRow, dailyRow, refRow] = await Promise.all([
    prisma.siteConfig.findUnique({ where: { key: 'pageviews' } }),
    prisma.siteConfig.findUnique({ where: { key: 'pageviews_daily' } }),
    prisma.siteConfig.findUnique({ where: { key: 'referrers' } }),
  ])

  const totals: Record<string, number> = pvRow ? JSON.parse(pvRow.value) : {}
  const daily: Record<string, Record<string, number>> = dailyRow ? JSON.parse(dailyRow.value) : {}
  const refs: Record<string, number> = refRow ? JSON.parse(refRow.value) : {}

  const total = Object.values(totals).reduce((s, v) => s + v, 0)

  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const todayViews = Object.values(daily[todayStr] || {}).reduce((s, v) => s + v, 0)

  const weekStart = new Date(now)
  weekStart.setDate(weekStart.getDate() - 6)
  const weekStartStr = weekStart.toISOString().split('T')[0]
  let weekViews = 0
  for (const [date, paths] of Object.entries(daily)) {
    if (date >= weekStartStr) weekViews += Object.values(paths).reduce((s, v) => s + v, 0)
  }

  const monthStart = new Date(now)
  monthStart.setDate(monthStart.getDate() - 29)
  const monthStartStr = monthStart.toISOString().split('T')[0]
  let monthViews = 0
  for (const [date, paths] of Object.entries(daily)) {
    if (date >= monthStartStr) monthViews += Object.values(paths).reduce((s, v) => s + v, 0)
  }

  const last30: DayStat[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const views = Object.values(daily[dateStr] || {}).reduce((s, v) => s + v, 0)
    last30.push({ date: dateStr, label: `${MONTHS[d.getMonth()]} ${d.getDate()}`, views })
  }

  const stats = Object.entries(totals)
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 20)

  const referrers = Object.entries(refs)
    .map(([domain, count]) => ({ domain, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  return { props: { stats, total, todayViews, weekViews, monthViews, last30, referrers } }
}
