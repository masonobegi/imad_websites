import { useState } from 'react'
import Head from 'next/head'
import { GetServerSideProps } from 'next'
import AdminLayout from '../../components/AdminLayout'
import { checkAdminCookie } from '../../lib/admin'
import { SiteConfig } from '../../lib/siteConfig'

interface PhotoItem { id: string; filename: string; title: string; category: string }
interface WorkItem { id: string; filename: string; title: string; type: 'watercolor' | 'encaustic' | 'oil' }

interface PageData {
  config: SiteConfig
  allPhotos: PhotoItem[]
  allWorks: WorkItem[]
}

// ─── Section wrapper ─────────────────────────────────────────────────────────

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  )
}

// ─── Shared form components (must live outside AdminSettings to avoid remount on each keystroke) ───

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  )
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white" />
  )
}

function TextArea({ value, onChange, rows = 3 }: { value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows}
      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none bg-white" />
  )
}

function Toggle({ on, onChange, label, description }: { on: boolean; onChange: () => void; label: string; description?: string }) {
  return (
    <button type="button" onClick={onChange} className="flex items-start gap-3 text-left w-full">
      <div className={`relative mt-0.5 w-10 h-5 rounded-full flex-shrink-0 transition-colors ${on ? 'bg-amber-500' : 'bg-gray-200'}`}>
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-5' : ''}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
    </button>
  )
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function AdminSettings({ config: initialConfig, allPhotos, allWorks }: PageData) {
  const [config, setConfig] = useState<SiteConfig>(initialConfig)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [activeTab, setActiveTab] = useState<'homepage' | 'pages' | 'featured' | 'social'>('homepage')

  function showSuccess(msg: string) {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3500)
  }

  function setHomepage(update: Partial<SiteConfig['homepage']>) {
    setConfig(prev => ({ ...prev, homepage: { ...prev.homepage, ...update } }))
  }
  function setSocial(update: Partial<SiteConfig['social']>) {
    setConfig(prev => ({ ...prev, social: { ...prev.social, ...update } }))
  }
  function setContact(update: Partial<SiteConfig['contact']>) {
    setConfig(prev => ({ ...prev, contact: { ...prev.contact, ...update } }))
  }
  function setStickers(update: Partial<SiteConfig['stickers']>) {
    setConfig(prev => ({ ...prev, stickers: { ...prev.stickers, ...update } }))
  }
  function setEncaustics(update: Partial<SiteConfig['encaustics']>) {
    setConfig(prev => ({ ...prev, encaustics: { ...prev.encaustics, ...update } }))
  }
  function setCommissions(update: Partial<SiteConfig['commissions']>) {
    setConfig(prev => ({ ...prev, commissions: { ...prev.commissions, ...update } }))
  }
  function setDigitalDesign(update: Partial<SiteConfig['digitalDesign']>) {
    setConfig(prev => ({ ...prev, digitalDesign: { ...prev.digitalDesign, ...update } }))
  }
  function setAbout(update: Partial<SiteConfig['about']>) {
    setConfig(prev => ({ ...prev, about: { ...prev.about, ...update } }))
  }
  function setFineArt(update: Partial<SiteConfig['fineArt']>) {
    setConfig(prev => ({ ...prev, fineArt: { ...prev.fineArt, ...update } }))
  }

  async function save() {
    setSaving(true)
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    })
    if (res.ok) showSuccess('Settings saved — changes are live!')
    setSaving(false)
  }

  // ── Featured photos ──────────────────────────────────────────────────────────

  function togglePhoto(id: string) {
    if (config.featuredPhotos.includes(id)) {
      setConfig(prev => ({ ...prev, featuredPhotos: prev.featuredPhotos.filter(p => p !== id) }))
    } else {
      if (config.featuredPhotos.length >= 6) return
      setConfig(prev => ({ ...prev, featuredPhotos: [...prev.featuredPhotos, id] }))
    }
  }

  function setHeroPhoto(id: string) {
    setHomepage({ heroPhotoId: id })
  }

  // ── Featured fine art ────────────────────────────────────────────────────────

  function toggleArt(id: string, type: WorkItem['type']) {
    if (config.featuredFineArt.some(f => f.id === id)) {
      setConfig(prev => ({ ...prev, featuredFineArt: prev.featuredFineArt.filter(f => f.id !== id) }))
    } else {
      if (config.featuredFineArt.length >= 6) return
      setConfig(prev => ({ ...prev, featuredFineArt: [...prev.featuredFineArt, { id, type }] }))
    }
  }

  // ── Shared UI helpers ────────────────────────────────────────────────────────

  const TABS = [
    { key: 'homepage' as const, label: 'Homepage Text' },
    { key: 'pages' as const, label: 'Pages' },
    { key: 'featured' as const, label: 'Featured Images' },
    { key: 'social' as const, label: 'Social & Contact' },
  ]

  const typeLabel: Record<WorkItem['type'], string> = { watercolor: 'Watercolor', encaustic: 'Encaustic', oil: 'Oil' }
  const typeColor: Record<WorkItem['type'], string> = { watercolor: 'text-blue-500', encaustic: 'text-amber-600', oil: 'text-emerald-600' }

  return (
    <AdminLayout>
      <Head><title>Settings | OBG Admin</title></Head>

      {/* Page header */}
      <div className="px-6 sm:px-8 pt-8 pb-0 border-b border-gray-200" style={{ background: '#FAF8F5' }}>
        <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
        <p className="text-sm text-gray-500 mt-1 mb-5">Customize everything on your website — no coding needed</p>

        <div className="flex gap-1">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2.5 text-sm font-medium transition-all rounded-t-xl border border-b-0 ${
                activeTab === t.key
                  ? 'bg-white border-gray-200 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Success toast */}
      {successMsg && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-xl flex items-center gap-2.5 animate-none">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          {successMsg}
        </div>
      )}

      <div className="px-6 sm:px-8 py-6 max-w-3xl space-y-5">

        {/* ═══════════════════════════════════════════════ HOMEPAGE TEXT */}
        {activeTab === 'homepage' && (
          <>
            {/* Hero */}
            <Section title="Hero Banner" subtitle="The big text over the main photo at the top of the page">
              <div className="space-y-4">
                <Field label="Your name / headline">
                  <TextInput value={config.homepage.heroHeadline} onChange={v => setHomepage({ heroHeadline: v })} placeholder="Imad Obegi" />
                </Field>
                <Field label="Tagline below your name">
                  <TextInput value={config.homepage.heroSubtext} onChange={v => setHomepage({ heroSubtext: v })} placeholder="Artist · Photographer · OBGillustrator.com" />
                </Field>
              </div>
            </Section>

            {/* Photography section */}
            <Section title="Photography Section" subtitle="Text above the photo strip on the homepage">
              <div className="space-y-4">
                <Field label="Section headline">
                  <TextInput value={config.homepage.photoStripHeadline} onChange={v => setHomepage({ photoStripHeadline: v })} placeholder="Photography" />
                </Field>
                <Field label="Section description (shown on desktop)">
                  <TextInput value={config.homepage.photoStripSubtext} onChange={v => setHomepage({ photoStripSubtext: v })} />
                </Field>
              </div>
            </Section>

            {/* Fine Art section */}
            <Section title="Fine Art Section" subtitle="Text above the fine art strip on the homepage">
              <div className="space-y-4">
                <Field label="Section headline">
                  <TextInput value={config.homepage.fineArtHeadline} onChange={v => setHomepage({ fineArtHeadline: v })} placeholder="Fine Art" />
                </Field>
                <Field label="Section description (shown on desktop)">
                  <TextInput value={config.homepage.fineArtSubtext} onChange={v => setHomepage({ fineArtSubtext: v })} />
                </Field>
              </div>
            </Section>

            {/* Stickers section */}
            <Section title="Stickers Section" subtitle="Text above the stickers strip on the homepage">
              <div className="space-y-4">
                <Field label="Section headline">
                  <TextInput value={config.homepage.stickersHeadline} onChange={v => setHomepage({ stickersHeadline: v })} placeholder="Stickers" />
                </Field>
                <Field label="Section description (shown on desktop)">
                  <TextInput value={config.homepage.stickersSubtext} onChange={v => setHomepage({ stickersSubtext: v })} />
                </Field>
              </div>
            </Section>

            {/* Digital Design section */}
            <Section title="Digital Design Section" subtitle="Text above the digital design section on the homepage">
              <div className="space-y-4">
                <Field label="Section headline">
                  <TextInput value={config.homepage.digitalHeadline} onChange={v => setHomepage({ digitalHeadline: v })} placeholder="Digital Design" />
                </Field>
                <Field label="Section description (shown on desktop)">
                  <TextInput value={config.homepage.digitalSubtext} onChange={v => setHomepage({ digitalSubtext: v })} />
                </Field>
              </div>
            </Section>

            {/* Commission section */}
            <Section title="Commission Section" subtitle="The call-to-action block at the bottom of the homepage">
              <div className="space-y-5">
                <Toggle
                  on={config.homepage.commissionOpen}
                  onChange={() => setHomepage({ commissionOpen: !config.homepage.commissionOpen })}
                  label="Commissions are open"
                  description="Turn this off to hide the entire commission section from the homepage"
                />
                {config.homepage.commissionOpen && (
                  <>
                    <Field label="Headline">
                      <TextInput value={config.homepage.commissionHeadline} onChange={v => setHomepage({ commissionHeadline: v })} placeholder="Have something in mind?" />
                    </Field>
                    <Field label="Body text">
                      <TextArea value={config.homepage.commissionBody} onChange={v => setHomepage({ commissionBody: v })} rows={3} />
                    </Field>
                    <Field label="Button text">
                      <TextInput value={config.homepage.commissionCta} onChange={v => setHomepage({ commissionCta: v })} placeholder="Commission a Piece" />
                    </Field>
                  </>
                )}
              </div>
            </Section>
          </>
        )}

        {/* ═══════════════════════════════════════════════ PAGES */}
        {activeTab === 'pages' && (
          <>
            <Section title="Welcome Message" subtitle="Optional intro text on the homepage, just below the hero photo">
              <div className="space-y-4">
                <Toggle
                  on={config.homepage.welcomeVisible}
                  onChange={() => setHomepage({ welcomeVisible: !config.homepage.welcomeVisible })}
                  label="Show welcome message"
                  description="Displays a short message below the hero photo"
                />
                {config.homepage.welcomeVisible && (
                  <Field label="Message text">
                    <TextArea value={config.homepage.welcomeText} onChange={v => setHomepage({ welcomeText: v })} rows={4} />
                  </Field>
                )}
              </div>
            </Section>

            <Section title="Encaustics Page Notice" subtitle="Amber notice block shown at the top of the Encaustics gallery — leave blank to hide">
              <Field label="Notice text" hint="A commission link is added below it automatically.">
                <TextArea value={config.encaustics.headerText} onChange={v => setEncaustics({ headerText: v })} rows={4} />
              </Field>
            </Section>

            <Section title="Stickers Page" subtitle="Heading and intro shown on the /stickers page">
              <div className="space-y-4">
                <Field label="Page heading">
                  <TextInput value={config.stickers.heading} onChange={v => setStickers({ heading: v })} placeholder="Original Character Designs" />
                </Field>
                <Field label="Intro paragraph">
                  <TextArea value={config.stickers.intro} onChange={v => setStickers({ intro: v })} rows={4} />
                </Field>
              </div>
            </Section>

            <Section title="Commission Form Intro" subtitle="Text at the top of the /commissions page, above the request form">
              <Field label="Intro text">
                <TextArea value={config.commissions.formIntro} onChange={v => setCommissions({ formIntro: v })} rows={4} />
              </Field>
            </Section>

            <Section title="Digital Design Page Intro" subtitle="Short intro paragraph on the /digital page">
              <Field label="Intro text">
                <TextArea value={config.digitalDesign.intro} onChange={v => setDigitalDesign({ intro: v })} rows={3} />
              </Field>
            </Section>

            <Section title="About Page" subtitle="Your bio and contact info on the /about page">
              <div className="space-y-4">
                <Field label="Tagline (shown above your name)" hint='e.g. "Artist · Photographer"'>
                  <TextInput value={config.about.tagline} onChange={v => setAbout({ tagline: v })} placeholder="Artist · Photographer" />
                </Field>
                <Field label="Bio" hint="Separate paragraphs with a blank line.">
                  <TextArea value={config.about.bio} onChange={v => setAbout({ bio: v })} rows={10} />
                </Field>
                <Field label="Phone number">
                  <TextInput value={config.about.phone} onChange={v => setAbout({ phone: v })} placeholder="650-483-9838" />
                </Field>
                <Field label="Mediums list" hint="Comma-separated. Shown as tags below the bio.">
                  <TextInput value={config.about.mediums} onChange={v => setAbout({ mediums: v })} placeholder="Photography, Encaustic Painting, Oil, Pastels, Watercolor, Illustration" />
                </Field>
              </div>
            </Section>

            <Section title="Fine Art Page" subtitle="Headline and intro on the /fine-art index page">
              <div className="space-y-4">
                <Field label="Page headline">
                  <TextInput value={config.fineArt.indexHeadline} onChange={v => setFineArt({ indexHeadline: v })} placeholder="Original Works" />
                </Field>
                <Field label="Page description">
                  <TextInput value={config.fineArt.indexDescription} onChange={v => setFineArt({ indexDescription: v })} placeholder="Paintings across watercolor, oil, encaustic, and pastel…" />
                </Field>
              </div>
            </Section>

            <Section title="Fine Art Category Descriptions" subtitle="Short descriptions shown below the title on each gallery page">
              <div className="space-y-4">
                <Field label="Watercolors page description">
                  <TextInput value={config.fineArt.watercolorsDescription} onChange={v => setFineArt({ watercolorsDescription: v })} placeholder="Original watercolor paintings by Imad Obegi." />
                </Field>
                <Field label="Encaustics page description">
                  <TextInput value={config.fineArt.encausticsDescription} onChange={v => setFineArt({ encausticsDescription: v })} placeholder="Paintings built up in layers of pigmented beeswax, fused with heat." />
                </Field>
                <Field label="Oil Paintings page description">
                  <TextInput value={config.fineArt.oilsDescription} onChange={v => setFineArt({ oilsDescription: v })} placeholder="Original oil paintings by Imad Obegi." />
                </Field>
              </div>
            </Section>
          </>
        )}

        {/* ═══════════════════════════════════════════════ FEATURED IMAGES */}
        {activeTab === 'featured' && (
          <>
            {/* Hero photo */}
            <Section title="Hero Photo" subtitle="The large background photo at the very top of the homepage — click to change">
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {allPhotos.map(photo => {
                  const isHero = config.homepage.heroPhotoId === photo.id
                  return (
                    <button key={photo.id} type="button" onClick={() => setHeroPhoto(photo.id)}
                      title={photo.title}
                      className={`relative rounded-xl overflow-hidden aspect-square transition-all ${
                        isHero ? 'ring-2 ring-amber-500 ring-offset-1 scale-105' : 'opacity-50 hover:opacity-100'
                      }`}>
                      <img src={`/photos/${photo.category}/${photo.filename}?v=5`} alt={photo.title}
                        className="w-full h-full object-cover" loading="lazy" />
                      {isHero && (
                        <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                          <svg className="w-6 h-6 text-amber-500 drop-shadow" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                          </svg>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-gray-400 mt-3">The starred photo is your current hero. Click any photo to switch.</p>
            </Section>

            {/* Featured photos */}
            <Section
              title="Homepage Photography Strip"
              subtitle={`${config.featuredPhotos.length} of 6 selected · click photos to add or remove`}
            >
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {allPhotos.map(photo => {
                  const sel = config.featuredPhotos.includes(photo.id)
                  const pos = config.featuredPhotos.indexOf(photo.id)
                  const maxed = !sel && config.featuredPhotos.length >= 6
                  return (
                    <button key={photo.id} type="button"
                      onClick={() => togglePhoto(photo.id)}
                      disabled={maxed}
                      title={photo.title}
                      className={`relative rounded-xl overflow-hidden aspect-square transition-all ${
                        sel ? 'ring-2 ring-amber-500 ring-offset-1' : maxed ? 'opacity-25 cursor-not-allowed' : 'opacity-50 hover:opacity-100'
                      }`}>
                      <img src={`/photos/${photo.category}/${photo.filename}?v=5`} alt={photo.title}
                        className="w-full h-full object-cover" loading="lazy" />
                      {sel && (
                        <div className="absolute inset-0 bg-amber-500/25 flex items-start justify-end p-1">
                          <span className="bg-amber-500 text-white w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shadow">
                            {pos + 1}
                          </span>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
              {config.featuredPhotos.length >= 6 && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3">
                  6 photos selected — deselect one before adding another.
                </p>
              )}
            </Section>

            {/* Featured fine art */}
            <Section
              title="Homepage Fine Art Strip"
              subtitle={`${config.featuredFineArt.length} of 6 selected · click artworks to add or remove`}
            >
              {['watercolor', 'encaustic', 'oil'].map(t => {
                const works = allWorks.filter(w => w.type === t)
                if (!works.length) return null
                return (
                  <div key={t} className="mb-5 last:mb-0">
                    <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${typeColor[t as WorkItem['type']]}`}>
                      {typeLabel[t as WorkItem['type']]}s
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {works.map(work => {
                        const sel = config.featuredFineArt.some(f => f.id === work.id)
                        const pos = config.featuredFineArt.findIndex(f => f.id === work.id)
                        const maxed = !sel && config.featuredFineArt.length >= 6
                        const folder = t === 'watercolor' ? 'watercolors' : t === 'encaustic' ? 'encaustics' : 'oils'
                        return (
                          <button key={work.id} type="button"
                            onClick={() => toggleArt(work.id, work.type)}
                            disabled={maxed}
                            title={work.title}
                            className={`relative rounded-xl overflow-hidden aspect-square transition-all text-left ${
                              sel ? 'ring-2 ring-amber-500 ring-offset-1' : maxed ? 'opacity-25 cursor-not-allowed' : 'opacity-50 hover:opacity-100'
                            }`}>
                            <img src={`/fine-art/${folder}/${work.filename}?v=5`} alt={work.title}
                              className="w-full h-full object-cover" loading="lazy" />
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-1.5 pb-1.5 pt-4">
                              <p className="text-white text-[9px] leading-tight line-clamp-2">{work.title}</p>
                            </div>
                            {sel && (
                              <div className="absolute top-1 right-1">
                                <span className="bg-amber-500 text-white w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shadow">
                                  {pos + 1}
                                </span>
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
              {config.featuredFineArt.length >= 6 && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2">
                  6 works selected — deselect one before adding another.
                </p>
              )}
            </Section>
          </>
        )}

        {/* ═══════════════════════════════════════════════ SOCIAL & CONTACT */}
        {activeTab === 'social' && (
          <>
            <Section title="Social Media" subtitle="Links shown in the footer of every page">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' }}>
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                  <Field label="Instagram profile URL">
                    <input type="url" value={config.social.instagram} onChange={e => setSocial({ instagram: e.target.value })}
                      placeholder="https://www.instagram.com/yourhandle/"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white" />
                  </Field>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#1877F2' }}>
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  <Field label="Facebook profile URL">
                    <input type="url" value={config.social.facebook} onChange={e => setSocial({ facebook: e.target.value })}
                      placeholder="https://www.facebook.com/yourname/"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white" />
                  </Field>
                </div>
              </div>
            </Section>

            <Section title="Contact & Notifications" subtitle="Where Imad receives order alerts and customer inquiries">
              <Field label="Your email address" hint="Order confirmations, commissions, and contact form messages go here">
                <input type="email" value={config.contact.ownerEmail} onChange={e => setContact({ ownerEmail: e.target.value })}
                  placeholder="imadobegi@gmail.com"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white" />
              </Field>
            </Section>
          </>
        )}

        {/* Sticky save bar */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 -mx-6 sm:-mx-8 px-6 sm:px-8 py-4 flex items-center justify-between gap-4">
          <p className="text-xs text-gray-400 hidden sm:block">Changes apply instantly to the live website after saving</p>
          <button onClick={save} disabled={saving}
            className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white font-semibold px-8 py-3 rounded-xl transition-colors disabled:opacity-60 text-sm flex items-center justify-center gap-2">
            {saving && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            )}
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
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
  const { readSiteConfig } = await import('../../lib/siteConfig')

  const [config, photos, fineArtWorks] = await Promise.all([
    readSiteConfig(),
    prisma.photo.findMany({ orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }] }),
    prisma.fineArtWork.findMany({ orderBy: { sortOrder: 'asc' } }),
  ])

  const allPhotos: PhotoItem[] = photos.map(p => ({ id: p.id, filename: p.filename, title: p.title, category: p.category }))

  const allWorks: WorkItem[] = fineArtWorks.map(w => ({
    id: w.id, filename: w.filename, title: w.title,
    type: w.type as 'watercolor' | 'encaustic' | 'oil',
  }))

  return { props: { config, allPhotos, allWorks } }
}
