import { useState, useRef } from 'react'
import Head from 'next/head'
import { GetServerSideProps } from 'next'
import fs from 'fs'
import path from 'path'
import AdminLayout from '../../components/AdminLayout'
import { checkAdminCookie } from '../../lib/admin'

// ─── Types ───────────────────────────────────────────────────────────────────

interface PrintSize { label: string; price: number }
interface BasicWork { id: string; filename: string; title: string; originalSize: string | null; available: boolean; description: string }
interface PleinAirImage { id: string; filename: string; title: string }
interface OilWork extends BasicWork {
  originalPrice: number | null
  reprintAvailable: boolean
  reprintPrice: number | null
  award: { title: string; url: string } | null
  pleinAirImages: PleinAirImage[]
}
interface Photo { id: string; filename: string; title: string; description: string; category: string }
interface PageData {
  fineArt: { works: { watercolors: BasicWork[]; encaustics: BasicWork[]; oils: OilWork[] } }
  photos: { categories: Record<string, { label: string }>; photos: Record<string, Photo[]> }
  stickers: string[]
  printConfig: { printSizes: PrintSize[] }
}

type Tab = 'photography' | 'watercolors' | 'encaustics' | 'oils' | 'stickers'
type ModalKind = 'photo' | 'watercolor' | 'encaustic' | 'oil' | 'sticker'

interface Draft {
  title: string; description: string; originalSize: string; available: boolean
  originalPrice: string; reprintAvailable: boolean; reprintPrice: string
  awardTitle: string; awardUrl: string; photoCategory: string
}

const emptyDraft: Draft = {
  title: '', description: '', originalSize: '', available: false,
  originalPrice: '', reprintAvailable: false, reprintPrice: '',
  awardTitle: '', awardUrl: '', photoCategory: 'nature',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function imgUrl(kind: ModalKind | string, category: string, filename: string) {
  if (kind === 'photo') return `/photos/${category}/${filename}`
  if (kind === 'watercolor') return `/fine-art/watercolors/${filename}`
  if (kind === 'encaustic') return `/fine-art/encaustics/${filename}`
  if (kind === 'oil') return `/fine-art/oils/${filename}`
  if (kind === 'sticker') return `/stickers/${filename}`
  return ''
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminProducts({ initialData }: { initialData: PageData }) {
  const [data, setData] = useState<PageData>(initialData)
  const [tab, setTab] = useState<Tab>('photography')

  // Edit modal state
  const [editKind, setEditKind] = useState<ModalKind | null>(null)
  const [editMode, setEditMode] = useState<'add' | 'edit'>('add')
  const [editItem, setEditItem] = useState<BasicWork | OilWork | Photo | null>(null)
  const [editCategory, setEditCategory] = useState('')

  // Form state
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [uploadPreview, setUploadPreview] = useState('')
  const [uploadFile, setUploadFile] = useState<{ base64: string; name: string } | null>(null)
  const [paUploads, setPaUploads] = useState<{ base64: string; name: string }[]>([])
  const [paItems, setPaItems] = useState<PleinAirImage[]>([])

  // Print pricing
  const [printSizes, setPrintSizes] = useState<PrintSize[]>(initialData.printConfig.printSizes)
  const [pricingDirty, setPricingDirty] = useState(false)

  // UI state
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string; category?: string; label: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)
  const paFileRef = useRef<HTMLInputElement>(null)

  // ── Open/close modals ───────────────────────────────────────────────────────

  function openAdd(kind: ModalKind, category = '') {
    setEditKind(kind)
    setEditMode('add')
    setEditItem(null)
    setEditCategory(category)
    setDraft({ ...emptyDraft, photoCategory: category || 'nature' })
    setUploadFile(null)
    setUploadPreview('')
    setPaUploads([])
    setPaItems([])
    setError('')
  }

  function openEdit(kind: ModalKind, item: BasicWork | OilWork | Photo, category = '') {
    setEditKind(kind)
    setEditMode('edit')
    setEditItem(item)
    setEditCategory(category)
    const oil = item as OilWork
    const photo = item as Photo
    setDraft({
      title: item.title,
      description: item.description,
      originalSize: (item as BasicWork).originalSize || '',
      available: (item as BasicWork).available || false,
      originalPrice: oil.originalPrice?.toString() || '',
      reprintAvailable: oil.reprintAvailable || false,
      reprintPrice: oil.reprintPrice?.toString() || '',
      awardTitle: oil.award?.title || '',
      awardUrl: oil.award?.url || '',
      photoCategory: photo.category || category || 'nature',
    })
    setUploadFile(null)
    setUploadPreview(imgUrl(kind, category || photo.category || '', item.filename))
    setPaUploads([])
    setPaItems(oil.pleinAirImages || [])
    setError('')
  }

  function closeModal() { setEditKind(null) }

  // ── File select ──────────────────────────────────────────────────────────────

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setUploadFile({ base64: result.split(',')[1], name: file.name })
      setUploadPreview(result)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function handlePaFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        setPaUploads(prev => [...prev, { base64: result.split(',')[1], name: file.name }])
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  // ── Save ────────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!draft.title.trim()) { setError('Title is required'); return }
    if (editMode === 'add' && !uploadFile && editKind !== 'sticker') {
      setError('Please upload an image'); return
    }
    setSaving(true)
    setError('')

    try {
      // 1. Upload main image
      let filename = (editItem as BasicWork)?.filename || ''
      if (uploadFile) {
        const ext = uploadFile.name.split('.').pop()?.toLowerCase() || 'jpg'
        const newName = editMode === 'add' ? `${toSlug(draft.title)}.${ext}` : filename || `${toSlug(draft.title)}.${ext}`
        const up = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: editKind,
            base64: uploadFile.base64,
            filename: newName,
            category: editKind === 'photo' ? draft.photoCategory : editCategory,
          }),
        })
        if (!up.ok) throw new Error('Image upload failed')
        filename = newName
      }

      if (editKind === 'sticker') {
        if (uploadFile && filename) {
          setData(prev => ({ ...prev, stickers: [...prev.stickers, filename].sort() }))
        }
        closeModal()
        setSaving(false)
        return
      }

      // 2. Upload plein air images for oils
      const newPaImages: PleinAirImage[] = []
      for (const pa of paUploads) {
        const ext = pa.name.split('.').pop()?.toLowerCase() || 'jpg'
        const slug = toSlug(pa.name.replace(/\.[^.]+$/, ''))
        const paFilename = `${slug}-pa.${ext}`
        await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'oil-pleinair', base64: pa.base64, filename: paFilename }),
        })
        newPaImages.push({ id: slug, filename: paFilename, title: pa.name.replace(/\.[^.]+$/, '') })
      }

      // 3. Build item data
      const id = editMode === 'add' ? toSlug(draft.title) : (editItem as BasicWork).id
      let itemData: unknown

      if (editKind === 'photo') {
        itemData = { id, filename, title: draft.title, description: draft.description, category: draft.photoCategory }
      } else if (editKind === 'watercolor' || editKind === 'encaustic') {
        itemData = { id, filename, title: draft.title, originalSize: draft.originalSize || null, available: draft.available, description: draft.description }
      } else if (editKind === 'oil') {
        itemData = {
          id, filename,
          title: draft.title, originalSize: draft.originalSize || null,
          available: draft.available, description: draft.description,
          originalPrice: draft.originalPrice ? parseFloat(draft.originalPrice) : null,
          reprintAvailable: draft.reprintAvailable,
          reprintPrice: draft.reprintPrice ? parseFloat(draft.reprintPrice) : null,
          award: draft.awardTitle ? { title: draft.awardTitle, url: draft.awardUrl } : null,
          pleinAirImages: [...paItems, ...newPaImages],
        }
      }

      // 4. Update JSON
      const jsonCategory = editKind === 'watercolor' ? 'watercolors'
        : editKind === 'encaustic' ? 'encaustics'
        : editKind === 'oil' ? 'oils'
        : draft.photoCategory

      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: editKind === 'photo' ? 'photo' : 'fineArt',
          action: editMode,
          category: jsonCategory,
          id,
          data: itemData,
        }),
      })
      if (!res.ok) throw new Error('Save failed')

      // 5. Update local state
      if (editKind === 'photo') {
        setData(prev => {
          const photos = { ...prev.photos.photos }
          const cat = (itemData as Photo).category
          if (editMode === 'add') photos[cat] = [...(photos[cat] || []), itemData as Photo]
          else photos[cat] = (photos[cat] || []).map(p => p.id === id ? itemData as Photo : p)
          return { ...prev, photos: { ...prev.photos, photos } }
        })
      } else if (editKind === 'watercolor') {
        setData(prev => {
          const works = editMode === 'add'
            ? [...prev.fineArt.works.watercolors, itemData as BasicWork]
            : prev.fineArt.works.watercolors.map(w => w.id === id ? itemData as BasicWork : w)
          return { ...prev, fineArt: { ...prev.fineArt, works: { ...prev.fineArt.works, watercolors: works } } }
        })
      } else if (editKind === 'encaustic') {
        setData(prev => {
          const works = editMode === 'add'
            ? [...prev.fineArt.works.encaustics, itemData as BasicWork]
            : prev.fineArt.works.encaustics.map(w => w.id === id ? itemData as BasicWork : w)
          return { ...prev, fineArt: { ...prev.fineArt, works: { ...prev.fineArt.works, encaustics: works } } }
        })
      } else if (editKind === 'oil') {
        setData(prev => {
          const works = editMode === 'add'
            ? [...prev.fineArt.works.oils, itemData as OilWork]
            : prev.fineArt.works.oils.map(w => w.id === id ? itemData as OilWork : w)
          return { ...prev, fineArt: { ...prev.fineArt, works: { ...prev.fineArt.works, oils: works } } }
        })
      }

      closeModal()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  // ── Delete ──────────────────────────────────────────────────────────────────

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: deleteTarget.type, action: 'delete', category: deleteTarget.category, id: deleteTarget.id }),
      })
      if (deleteTarget.type === 'photo') {
        setData(prev => {
          const photos = { ...prev.photos.photos }
          const cat = deleteTarget.category!
          photos[cat] = (photos[cat] || []).filter(p => p.id !== deleteTarget.id)
          return { ...prev, photos: { ...prev.photos, photos } }
        })
      } else if (deleteTarget.type === 'fineArt') {
        const cat = deleteTarget.category as 'watercolors' | 'encaustics' | 'oils'
        setData(prev => ({
          ...prev,
          fineArt: {
            ...prev.fineArt,
            works: { ...prev.fineArt.works, [cat]: prev.fineArt.works[cat].filter(w => w.id !== deleteTarget.id) }
          }
        }))
      } else if (deleteTarget.type === 'sticker') {
        setData(prev => ({ ...prev, stickers: prev.stickers.filter(s => s !== deleteTarget.id) }))
      }
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  // ── Save pricing ─────────────────────────────────────────────────────────────

  async function savePricing() {
    setSaving(true)
    const res = await fetch('/api/admin/products', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'printConfig', data: { printSizes } }),
    })
    if (res.ok) {
      setPricingDirty(false)
      setData(prev => ({ ...prev, printConfig: { ...prev.printConfig, printSizes } }))
    }
    setSaving(false)
  }

  // ── Tab content renderers ────────────────────────────────────────────────────

  function PhotographyTab() {
    return (
      <div className="space-y-8">
        {/* Pricing table */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-800">Print Pricing</h2>
              <p className="text-sm text-gray-400 mt-0.5">Applies to all photography prints</p>
            </div>
            {pricingDirty && (
              <button
                onClick={savePricing}
                disabled={saving}
                className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save Pricing'}
              </button>
            )}
          </div>
          <div className="space-y-2">
            {printSizes.map((size, i) => (
              <div key={size.label} className="flex items-center gap-4">
                <span className="text-sm text-gray-600 w-16 font-medium">{size.label}</span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="number"
                    value={size.price}
                    onChange={e => {
                      const updated = printSizes.map((s, j) => j === i ? { ...s, price: parseInt(e.target.value) || 0 } : s)
                      setPrintSizes(updated)
                      setPricingDirty(true)
                    }}
                    className="border border-gray-200 rounded-lg pl-7 pr-3 py-2 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Photos by category */}
        {Object.entries(data.photos.categories).map(([catSlug, cat]) => (
          <div key={catSlug} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">{cat.label}</h2>
              <button
                onClick={() => openAdd('photo', catSlug)}
                className="text-sm text-amber-600 border border-amber-300 hover:bg-amber-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                + Add Photo
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {(data.photos.photos[catSlug] || []).map(photo => (
                <div key={photo.id} className="group relative">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img src={imgUrl('photo', catSlug, photo.filename)} alt={photo.title} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <p className="text-xs text-gray-600 mt-1 truncate">{photo.title}</p>
                  <div className="flex gap-1.5 mt-1">
                    <button onClick={() => openEdit('photo', photo, catSlug)} className="text-xs text-amber-600 hover:text-amber-700">Edit</button>
                    <span className="text-gray-300 text-xs">·</span>
                    <button onClick={() => setDeleteTarget({ type: 'photo', id: photo.id, category: catSlug, label: photo.title })} className="text-xs text-red-400 hover:text-red-600">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  function WorksTab({ category, kind }: { category: 'watercolors' | 'encaustics'; kind: ModalKind }) {
    const works = data.fineArt.works[category] || []
    const label = category === 'watercolors' ? 'Watercolors' : 'Encaustics'
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-gray-800">{label}</h2>
            <p className="text-sm text-gray-400 mt-0.5">{works.length} works</p>
          </div>
          <button onClick={() => openAdd(kind)} className="text-sm text-amber-600 border border-amber-300 hover:bg-amber-50 px-3 py-1.5 rounded-lg transition-colors">
            + Add {label === 'Watercolors' ? 'Watercolor' : 'Encaustic'}
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {works.map(work => (
            <div key={work.id}>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                <img src={imgUrl(kind, category, work.filename)} alt={work.title} className="w-full h-full object-cover" loading="lazy" />
                {work.available && (
                  <span className="absolute top-1.5 left-1.5 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">Available</span>
                )}
              </div>
              <p className="text-xs text-gray-700 mt-1.5 font-medium truncate">{work.title}</p>
              {work.originalSize && <p className="text-[11px] text-gray-400">{work.originalSize}</p>}
              <div className="flex gap-1.5 mt-1">
                <button onClick={() => openEdit(kind, work)} className="text-xs text-amber-600 hover:text-amber-700">Edit</button>
                <span className="text-gray-300 text-xs">·</span>
                <button onClick={() => setDeleteTarget({ type: 'fineArt', id: work.id, category, label: work.title })} className="text-xs text-red-400 hover:text-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  function OilsTab() {
    const oils = data.fineArt.works.oils || []
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-gray-800">Oil Paintings</h2>
            <p className="text-sm text-gray-400 mt-0.5">{oils.length} paintings</p>
          </div>
          <button onClick={() => openAdd('oil')} className="text-sm text-amber-600 border border-amber-300 hover:bg-amber-50 px-3 py-1.5 rounded-lg transition-colors">
            + Add Painting
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {oils.map(oil => (
            <div key={oil.id}>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                <img src={imgUrl('oil', 'oils', oil.filename)} alt={oil.title} className="w-full h-full object-cover" loading="lazy" />
                {oil.available && (
                  <span className="absolute top-1.5 left-1.5 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">Available</span>
                )}
              </div>
              <p className="text-xs text-gray-700 mt-1.5 font-medium truncate">{oil.title}</p>
              <p className="text-[11px] text-gray-400">
                {oil.originalPrice ? `$${oil.originalPrice} original` : 'Inquiry only'}
                {oil.reprintAvailable && ` · $${oil.reprintPrice} reprint`}
              </p>
              {oil.pleinAirImages.length > 0 && (
                <p className="text-[11px] text-blue-400">{oil.pleinAirImages.length} process image{oil.pleinAirImages.length !== 1 ? 's' : ''}</p>
              )}
              <div className="flex gap-1.5 mt-1">
                <button onClick={() => openEdit('oil', oil)} className="text-xs text-amber-600 hover:text-amber-700">Edit</button>
                <span className="text-gray-300 text-xs">·</span>
                <button onClick={() => setDeleteTarget({ type: 'fineArt', id: oil.id, category: 'oils', label: oil.title })} className="text-xs text-red-400 hover:text-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  function StickersTab() {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-gray-800">Stickers</h2>
            <p className="text-sm text-gray-400 mt-0.5">{data.stickers.length} stickers · sold via Sticker Mule</p>
          </div>
          <button onClick={() => openAdd('sticker')} className="text-sm text-amber-600 border border-amber-300 hover:bg-amber-50 px-3 py-1.5 rounded-lg transition-colors">
            + Add Sticker
          </button>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {data.stickers.map(s => (
            <div key={s}>
              <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                <img src={`/stickers/${s}`} alt={s} className="w-full h-full object-contain p-2" loading="lazy" />
              </div>
              <p className="text-[10px] text-gray-400 mt-1 truncate">{s.replace(/\.[^.]+$/, '')}</p>
              <button onClick={() => setDeleteTarget({ type: 'sticker', id: s, label: s })} className="text-[10px] text-red-400 hover:text-red-600">Delete</button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Modal form ───────────────────────────────────────────────────────────────

  function field(label: string, content: React.ReactNode) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
        {content}
      </div>
    )
  }

  const inp = (value: string, onChange: (v: string) => void, placeholder = '', type = 'text') => (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
    />
  )

  const textarea = (value: string, onChange: (v: string) => void) => (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      rows={3}
      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
    />
  )

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <AdminLayout>
      <Head><title>Products | OBG Admin</title></Head>

      <div className="px-4 sm:px-8 py-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Products</h1>

        {/* Tab bar */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 overflow-x-auto">
          {([
            { key: 'photography', label: 'Photography' },
            { key: 'watercolors', label: 'Watercolors' },
            { key: 'encaustics', label: 'Encaustics' },
            { key: 'oils', label: 'Oil Paintings' },
            { key: 'stickers', label: 'Stickers' },
          ] as { key: Tab; label: string }[]).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'photography' && <PhotographyTab />}
        {tab === 'watercolors' && <WorksTab category="watercolors" kind="watercolor" />}
        {tab === 'encaustics' && <WorksTab category="encaustics" kind="encaustic" />}
        {tab === 'oils' && <OilsTab />}
        {tab === 'stickers' && <StickersTab />}
      </div>

      {/* ── Edit / Add modal ─────────────────────────────────────────────────── */}
      {editKind && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">
                {editMode === 'add' ? 'Add' : 'Edit'}{' '}
                {editKind === 'photo' ? 'Photo' : editKind === 'watercolor' ? 'Watercolor' : editKind === 'encaustic' ? 'Encaustic' : editKind === 'oil' ? 'Oil Painting' : 'Sticker'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Image {editMode === 'add' && <span className="text-red-400">*</span>}
                  {editMode === 'edit' && <span className="font-normal text-gray-400"> (upload to replace)</span>}
                </label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-amber-400 transition-colors"
                >
                  {uploadPreview ? (
                    <img src={uploadPreview} alt="Preview" className="max-h-40 mx-auto rounded-lg object-contain" />
                  ) : (
                    <div className="py-6">
                      <p className="text-gray-400 text-sm">Click to upload image</p>
                      <p className="text-gray-300 text-xs mt-1">JPG or PNG, watermark applied automatically</p>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
              </div>

              {/* Sticker: just upload, no other fields */}
              {editKind !== 'sticker' && (
                <>
                  {field('Title', inp(draft.title, v => setDraft(d => ({ ...d, title: v }))))}
                  {field('Description', textarea(draft.description, v => setDraft(d => ({ ...d, description: v }))))}

                  {/* Photo category */}
                  {editKind === 'photo' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                      <select
                        value={draft.photoCategory}
                        onChange={e => setDraft(d => ({ ...d, photoCategory: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                      >
                        {Object.entries(data.photos.categories).map(([slug, cat]) => (
                          <option key={slug} value={slug}>{cat.label}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Size (for fine art) */}
                  {(editKind === 'watercolor' || editKind === 'encaustic' || editKind === 'oil') && (
                    field('Original Size', inp(draft.originalSize, v => setDraft(d => ({ ...d, originalSize: v })), 'e.g. 9" x 12"'))
                  )}

                  {/* Available toggle (for fine art) */}
                  {(editKind === 'watercolor' || editKind === 'encaustic' || editKind === 'oil') && (
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setDraft(d => ({ ...d, available: !d.available }))}
                        className={`relative w-11 h-6 rounded-full transition-colors ${draft.available ? 'bg-green-500' : 'bg-gray-200'}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${draft.available ? 'translate-x-5' : ''}`} />
                      </button>
                      <span className="text-sm text-gray-700">
                        {draft.available ? 'Available for sale' : 'Not currently for sale'}
                      </span>
                    </div>
                  )}

                  {/* Oil-specific fields */}
                  {editKind === 'oil' && (
                    <>
                      <div className="border-t border-gray-100 pt-4">
                        <p className="text-sm font-medium text-gray-700 mb-3">Pricing</p>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <label className="text-sm text-gray-600 w-32">Original price</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                              <input
                                type="number"
                                value={draft.originalPrice}
                                onChange={e => setDraft(d => ({ ...d, originalPrice: e.target.value }))}
                                placeholder="950"
                                className="border border-gray-200 rounded-xl pl-7 pr-3 py-2.5 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-amber-400"
                              />
                            </div>
                            <span className="text-xs text-gray-400">(blank = inquiry only)</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setDraft(d => ({ ...d, reprintAvailable: !d.reprintAvailable }))}
                              className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${draft.reprintAvailable ? 'bg-green-500' : 'bg-gray-200'}`}
                            >
                              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${draft.reprintAvailable ? 'translate-x-5' : ''}`} />
                            </button>
                            <span className="text-sm text-gray-600">Reprints available</span>
                          </div>
                          {draft.reprintAvailable && (
                            <div className="flex items-center gap-3">
                              <label className="text-sm text-gray-600 w-32">Reprint price</label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                                <input
                                  type="number"
                                  value={draft.reprintPrice}
                                  onChange={e => setDraft(d => ({ ...d, reprintPrice: e.target.value }))}
                                  placeholder="95"
                                  className="border border-gray-200 rounded-xl pl-7 pr-3 py-2.5 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-amber-400"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="border-t border-gray-100 pt-4">
                        <p className="text-sm font-medium text-gray-700 mb-3">Award <span className="font-normal text-gray-400">(optional)</span></p>
                        {field('Award title', inp(draft.awardTitle, v => setDraft(d => ({ ...d, awardTitle: v })), 'e.g. Winner — 2024 Art Competition'))}
                        {field('Award URL', inp(draft.awardUrl, v => setDraft(d => ({ ...d, awardUrl: v })), 'https://'))}
                      </div>

                      <div className="border-t border-gray-100 pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-medium text-gray-700">Process / Plein Air Images <span className="font-normal text-gray-400">(optional)</span></p>
                          <button type="button" onClick={() => paFileRef.current?.click()} className="text-xs text-amber-600 border border-amber-300 hover:bg-amber-50 px-2.5 py-1 rounded-lg transition-colors">
                            + Upload
                          </button>
                        </div>
                        <input ref={paFileRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePaFileSelect} />
                        <div className="grid grid-cols-4 gap-2">
                          {paItems.map(pa => (
                            <div key={pa.id} className="relative group">
                              <img src={imgUrl('oil', 'oils', pa.filename)} alt={pa.title} className="aspect-square object-cover rounded-lg w-full" loading="lazy" />
                              <button
                                type="button"
                                onClick={() => setPaItems(prev => prev.filter(p => p.id !== pa.id))}
                                className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-4 h-4 text-xs leading-none opacity-0 group-hover:opacity-100 transition-opacity"
                              >×</button>
                            </div>
                          ))}
                          {paUploads.map((pa, i) => (
                            <div key={i} className="relative group">
                              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                                <span className="text-xs text-gray-400 text-center p-1">{pa.name}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setPaUploads(prev => prev.filter((_, j) => j !== i))}
                                className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-4 h-4 text-xs leading-none"
                              >×</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-medium py-2.5 rounded-xl transition-colors disabled:opacity-60 text-sm"
              >
                {saving ? 'Saving…' : editMode === 'add' ? 'Add' : 'Save Changes'}
              </button>
              <button onClick={closeModal} className="px-5 py-2.5 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirm ──────────────────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h2 className="font-semibold text-gray-800 mb-2">Delete this item?</h2>
            <p className="text-sm text-gray-500 mb-5">
              <strong>{deleteTarget.label}</strong> will be removed from the website. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 rounded-xl transition-colors disabled:opacity-60 text-sm"
              >
                {deleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
              <button onClick={() => setDeleteTarget(null)} className="px-5 py-2.5 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  if (!checkAdminCookie(req.headers.cookie || '')) {
    return { redirect: { destination: '/admin/login', permanent: false } }
  }

  const fineArt = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public', 'fine-art', 'data.json'), 'utf-8'))
  const photos = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public', 'photos', 'data.json'), 'utf-8'))
  const config = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public', 'photos', 'config.json'), 'utf-8'))
  const stickers = fs.readdirSync(path.join(process.cwd(), 'public', 'stickers'))
    .filter((f: string) => /\.(png|jpg|jpeg|webp)$/i.test(f)).sort()

  return { props: { initialData: { fineArt, photos, stickers, printConfig: config } } }
}
