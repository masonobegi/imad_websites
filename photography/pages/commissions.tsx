import { useState } from 'react'
import Head from 'next/head'
import { GetServerSideProps } from 'next'
import Layout from '../components/Layout'

const WORK_TYPES = [
  'Watercolor painting',
  'Encaustic painting',
  'Fine art photography print',
  'Custom sticker design',
  'Digital design / illustration',
  'Other / not sure yet',
]

interface Props { formIntro: string }

export default function Commissions({ formIntro }: Props) {
  const [form, setForm] = useState({ name: '', email: '', workType: '', description: '', budget: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.description) return
    setStatus('sending')
    try {
      const res = await fetch('/api/send-commission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setStatus(res.ok ? 'sent' : 'error')
    } catch {
      setStatus('error')
    }
  }

  const inputCls = 'w-full bg-canvas border border-edge px-4 py-3 text-sm text-ink placeholder-mist focus:outline-none focus:border-shadow transition-colors'
  const labelCls = 'block text-xs text-mist uppercase tracking-widest mb-1.5'

  return (
    <Layout>
      <Head>
        <title>Custom Commission | OBGillustrator.com</title>
        <meta name="description" content="Request a custom painting, print, or design from Imad Obegi — watercolors, encaustics, photography, and more." />
      </Head>

      <div className="max-w-2xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <div className="mb-10">
          <p className="text-xs text-copper uppercase tracking-widest mb-3">Custom Work</p>
          <h1 className="font-serif text-4xl sm:text-5xl text-ink mb-4">Commission a Piece</h1>
          <p className="text-mist text-base leading-relaxed max-w-lg">
            {formIntro}
          </p>
        </div>

        {status === 'sent' ? (
          <div className="border border-edge px-8 py-10 text-center">
            <p className="font-serif text-2xl text-ink mb-3">Request received</p>
            <p className="text-mist text-sm">
              Imad will be in touch at <span className="text-ink">{form.email}</span>.
              Check your inbox for a confirmation.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={set('name')}
                  placeholder="Your name"
                  required
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="your@email.com"
                  required
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Type of work</label>
              <select value={form.workType} onChange={set('workType')} className={inputCls}>
                <option value="">Select one…</option>
                {WORK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className={labelCls}>Describe your request *</label>
              <textarea
                value={form.description}
                onChange={set('description')}
                placeholder="Tell Imad what you're envisioning — subject, size, occasion, mood, any reference images you have in mind…"
                required
                rows={6}
                className={inputCls + ' resize-none'}
              />
            </div>

            <div>
              <label className={labelCls}>Budget (optional)</label>
              <input
                type="text"
                value={form.budget}
                onChange={set('budget')}
                placeholder="e.g. $200–$400, or flexible"
                className={inputCls}
              />
            </div>

            {status === 'error' && (
              <p className="text-sm text-red-500">Something went wrong — please try again or email imadobegi@gmail.com directly.</p>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full bg-copper text-darkroom py-4 text-sm tracking-wider uppercase hover:bg-amber-600 active:bg-amber-700 transition-colors disabled:opacity-60"
            >
              {status === 'sending' ? 'Sending…' : 'Send Request'}
            </button>

            <p className="text-xs text-mist text-center">
              Or email directly at{' '}
              <a href="mailto:imadobegi@gmail.com" className="text-copper hover:underline">imadobegi@gmail.com</a>
            </p>
          </form>
        )}
      </div>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const { readSiteConfig } = await import('../lib/siteConfig')
  const siteConfig = await readSiteConfig()
  return { props: { formIntro: siteConfig.commissions.formIntro } }
}
