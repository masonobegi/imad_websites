import { useState, useRef, useEffect } from 'react'
import Head from 'next/head'
import { GetServerSideProps } from 'next'
import AdminLayout from '../../components/AdminLayout'
import { checkAdminCookie } from '../../lib/admin'

// ─── Types ───────────────────────────────────────────────────────────────────

interface PrintSize { label: string; price: number }
interface BasicWork {
  id: string; filename: string; title: string; originalSize: string | null
  available: boolean; description: string; price: number | null
  reprintAvailable?: boolean; reprintPrice?: number | null; reprintMedium?: string | null
  pleinAirImages?: PleinAirImage[]
  awardTitle?: string | null; awardUrl?: string | null
}
interface PleinAirImage { id: string; filename: string; title: string }
interface ProcessImage { id: string; filename: string }
interface ProcessEntry { id: string; title: string; description: string; images: ProcessImage[] }
interface OilWork extends BasicWork {
  originalPrice: number | null; reprintAvailable: boolean; reprintPrice: number | null
  award: { title: string; url: string } | null; pleinAirImages: PleinAirImage[]
}
interface Photo { id: string; filename: string; title: string; description: string; category: string }
interface HashtagItem { id: string; title: string; type: string; category?: string; filename: string; tags: string[] }
interface PageData {
  fineArt: { works: { watercolors: BasicWork[]; encaustics: BasicWork[]; oils: OilWork[]; digitals: BasicWork[] } }
  photos: { categories: Record<string, { label: string }>; photos: Record<string, Photo[]> }
  stickers: string[]
  printConfig: { printSizes: PrintSize[] }
  process: ProcessEntry[]
}

type Tab = 'photography' | 'watercolors' | 'encaustics' | 'oils' | 'stickers' | 'digital' | 'process' | 'hashtags'
type ModalKind = 'photo' | 'watercolor' | 'encaustic' | 'oil' | 'sticker' | 'digital' | 'process'

interface Draft {
  title: string; description: string; originalSize: string; available: boolean; price: string
  originalPrice: string; reprintAvailable: boolean; reprintPrice: string; reprintMedium: string
  awardTitle: string; awardUrl: string; photoCategory: string
}

const emptyDraft: Draft = {
  title: '', description: '', originalSize: '', available: false, price: '',
  originalPrice: '', reprintAvailable: false, reprintPrice: '', reprintMedium: '',
  awardTitle: '', awardUrl: '', photoCategory: 'nature',
}

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function imgUrl(kind: ModalKind | string, category: string, filename: string) {
  if (kind === 'photo') return `/photos/${category}/${filename}?v=5`
  if (kind === 'watercolor') return `/fine-art/watercolors/${filename}?v=5`
  if (kind === 'encaustic') return `/fine-art/encaustics/${filename}?v=5`
  if (kind === 'oil') return `/fine-art/oils/${filename}?v=5`
  if (kind === 'digital') return `/digital/${filename}?v=5`
  if (kind === 'process') return `/fine-art/process/${filename}?v=5`
  if (kind === 'sticker') return `/stickers/${filename}?v=5`
  return ''
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminProducts({ initialData }: { initialData: PageData }) {
  const [data, setData] = useState<PageData>(initialData)
  const [tab, setTab] = useState<Tab>('photography')

  const [editKind, setEditKind] = useState<ModalKind | null>(null)
  const [editMode, setEditMode] = useState<'add' | 'edit'>('add')
  const [editItem, setEditItem] = useState<BasicWork | OilWork | Photo | null>(null)
  const [editCategory, setEditCategory] = useState('')
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [uploadPreview, setUploadPreview] = useState('')
  const [uploadFile, setUploadFile] = useState<{ base64: string; name: string } | null>(null)
  const [paUploads, setPaUploads] = useState<{ base64: string; name: string; isVideo?: boolean }[]>([])
  const [paItems, setPaItems] = useState<PleinAirImage[]>([])
  const [dragOverUpload, setDragOverUpload] = useState(false)

  const [printSizes, setPrintSizes] = useState<PrintSize[]>(initialData.printConfig.printSizes)
  const [pricingDirty, setPricingDirty] = useState(false)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string; category?: string; label: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [showNewCat, setShowNewCat] = useState(false)
  const [newCatLabel, setNewCatLabel] = useState('')
  const [newCatDesc, setNewCatDesc] = useState('')
  const [creatingCat, setCreatingCat] = useState(false)

  // Drag-to-reorder state
  const dragSrcRef = useRef<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)

  // Hashtags tab state
  const [hashItems, setHashItems] = useState<HashtagItem[] | null>(null)
  const [hashGenerating, setHashGenerating] = useState(false)
  const [hashEditId, setHashEditId] = useState<string | null>(null)
  const [hashEditTags, setHashEditTags] = useState<string[]>([])
  const [hashSavingId, setHashSavingId] = useState<string | null>(null)
  const [hashCopied, setHashCopied] = useState<string | null>(null)

  useEffect(() => {
    if (tab === 'hashtags' && hashItems === null) {
      fetch('/api/admin/hashtags').then(r => r.json()).then(setHashItems)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  const fileRef = useRef<HTMLInputElement>(null)
  const paFileRef = useRef<HTMLInputElement>(null)

  // ── Toasts ──────────────────────────────────────────────────────────────────

  function showSuccess(msg: string) {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  // ── Modals ──────────────────────────────────────────────────────────────────

  function openAdd(kind: ModalKind, category = '') {
    setEditKind(kind); setEditMode('add'); setEditItem(null); setEditCategory(category)
    setDraft({ ...emptyDraft, photoCategory: category || 'nature' })
    setUploadFile(null); setUploadPreview(''); setPaUploads([]); setPaItems([]); setError('')
  }

  function openEdit(kind: ModalKind, item: BasicWork | OilWork | Photo | ProcessEntry, category = '') {
    setEditKind(kind); setEditMode('edit'); setEditItem(item as BasicWork); setEditCategory(category)
    if (kind === 'process') {
      const proc = item as ProcessEntry
      setDraft({ ...emptyDraft, title: proc.title, description: proc.description })
      setUploadFile(null); setUploadPreview(''); setPaUploads([])
      setPaItems(proc.images.map(img => ({ id: img.id, filename: img.filename, title: '' })))
      setError(''); return
    }
    const oil = item as OilWork; const photo = item as Photo
    setDraft({
      title: item.title, description: item.description,
      originalSize: (item as BasicWork).originalSize || '',
      available: (item as BasicWork).available || false,
      price: (item as BasicWork).price?.toString() || '',
      originalPrice: oil.originalPrice?.toString() || '',
      reprintAvailable: oil.reprintAvailable || (item as BasicWork).reprintAvailable || false,
      reprintPrice: (oil.reprintPrice ?? (item as BasicWork).reprintPrice)?.toString() || '',
      reprintMedium: (item as BasicWork).reprintMedium || '',
      awardTitle: oil.award?.title || (item as BasicWork).awardTitle || '', awardUrl: oil.award?.url || (item as BasicWork).awardUrl || '',
      photoCategory: photo.category || category || 'nature',
    })
    setUploadFile(null)
    setUploadPreview(imgUrl(kind, category || (photo.category) || '', (item as BasicWork).filename))
    setPaUploads([])
    setPaItems(oil.pleinAirImages || (item as BasicWork).pleinAirImages || [])
    setError('')
  }

  function closeModal() { setEditKind(null) }

  // ── File handling ────────────────────────────────────────────────────────────

  function processFile(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setUploadFile({ base64: result.split(',')[1], name: file.name })
      setUploadPreview(result)
    }
    reader.readAsDataURL(file)
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    processFile(file); e.target.value = ''
  }

  function handleUploadDrop(e: React.DragEvent) {
    e.preventDefault(); setDragOverUpload(false)
    const file = e.dataTransfer.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    processFile(file)
  }

  function handlePaFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    Array.from(e.target.files || []).forEach(file => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        setPaUploads(prev => [...prev, { base64: result.split(',')[1], name: file.name, isVideo: file.type.startsWith('video/') }])
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  // ── Save ────────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!draft.title.trim() && editKind !== 'sticker') { setError('Title is required'); return }
    if (editMode === 'add' && !uploadFile && editKind !== 'sticker' && editKind !== 'process') {
      setError('Please upload an image'); return
    }
    if (editKind === 'process' && editMode === 'add' && paUploads.length === 0) {
      setError('Please add at least one image'); return
    }
    setSaving(true); setError('')
    try {
      let filename = (editItem as BasicWork)?.filename || ''
      if (uploadFile) {
        const ext = uploadFile.name.split('.').pop()?.toLowerCase() || 'jpg'
        const slugBase = draft.title.trim() ? toSlug(draft.title) : toSlug(uploadFile.name.replace(/\.[^.]+$/, ''))
        const newName = editMode === 'add' ? `${slugBase}.${ext}` : filename || `${slugBase}.${ext}`
        const up = await fetch('/api/admin/upload', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: editKind, base64: uploadFile.base64, filename: newName, category: editKind === 'photo' ? draft.photoCategory : editCategory }),
        })
        if (!up.ok) throw new Error('Image upload failed')
        filename = newName
      }

      if (editKind === 'sticker') {
        if (uploadFile && filename) setData(prev => ({ ...prev, stickers: [...prev.stickers, filename].sort() }))
        closeModal(); setSaving(false); showSuccess('Sticker added!'); return
      }

      const newPaImages: PleinAirImage[] = []
      for (const pa of paUploads) {
        const ext = pa.name.split('.').pop()?.toLowerCase() || 'jpg'
        const slug = toSlug(pa.name.replace(/\.[^.]+$/, ''))
        const paFilename = `${slug}-process.${ext}`
        const folderMap: Record<string, string> = {
          oil: 'fine-art/oils',
          watercolor: 'fine-art/watercolors',
          encaustic: 'fine-art/encaustics',
          process: 'fine-art/process',
        }
        const folder = folderMap[editKind || ''] || 'fine-art/oils'
        const uploadEndpoint = pa.isVideo ? '/api/admin/upload-video' : '/api/admin/upload'
        const uploadBody = pa.isVideo
          ? JSON.stringify({ folder, base64: pa.base64, filename: paFilename })
          : JSON.stringify({ type: editKind === 'oil' ? 'oil-pleinair' : editKind === 'watercolor' ? 'watercolor-process' : editKind === 'encaustic' ? 'encaustic-process' : editKind, base64: pa.base64, filename: paFilename })
        await fetch(uploadEndpoint, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: uploadBody,
        })
        newPaImages.push({ id: slug, filename: paFilename, title: pa.name.replace(/\.[^.]+$/, '') })
      }

      const id = editMode === 'add' ? toSlug(draft.title) : (editItem as BasicWork).id
      let itemData: unknown

      if (editKind === 'photo') {
        itemData = { id, filename, title: draft.title, description: draft.description, category: draft.photoCategory }
      } else if (editKind === 'watercolor') {
        itemData = {
          id, filename, title: draft.title, originalSize: draft.originalSize || null,
          available: draft.available, description: draft.description,
          price: draft.price ? parseFloat(draft.price) : null,
          reprintAvailable: draft.reprintAvailable,
          reprintPrice: draft.reprintPrice ? parseFloat(draft.reprintPrice) : null,
          reprintMedium: draft.reprintMedium || null,
          pleinAirImages: [...paItems, ...newPaImages],
        }
      } else if (editKind === 'encaustic') {
        itemData = {
          id, filename, title: draft.title, originalSize: draft.originalSize || null,
          available: draft.available, description: draft.description,
          price: draft.price ? parseFloat(draft.price) : null,
          reprintAvailable: draft.reprintAvailable,
          reprintPrice: draft.reprintPrice ? parseFloat(draft.reprintPrice) : null,
          reprintMedium: draft.reprintMedium || null,
          pleinAirImages: [...paItems, ...newPaImages],
        }
      } else if (editKind === 'oil') {
        itemData = {
          id, filename, title: draft.title, originalSize: draft.originalSize || null,
          available: draft.available, description: draft.description,
          originalPrice: draft.originalPrice ? parseFloat(draft.originalPrice) : null,
          reprintAvailable: draft.reprintAvailable,
          reprintPrice: draft.reprintPrice ? parseFloat(draft.reprintPrice) : null,
          reprintMedium: draft.reprintMedium || null,
          award: draft.awardTitle ? { title: draft.awardTitle, url: draft.awardUrl } : null,
          pleinAirImages: [...paItems, ...newPaImages],
        }
      } else if (editKind === 'digital') {
        itemData = {
          id, filename, title: draft.title, originalSize: draft.originalSize || null,
          available: false, description: draft.description, price: null, pleinAirImages: [],
          award: draft.awardTitle ? { title: draft.awardTitle, url: draft.awardUrl } : null,
        }
      } else if (editKind === 'process') {
        itemData = {
          id, title: draft.title, description: draft.description,
          images: [...paItems.map(p => ({ id: p.id, filename: p.filename })), ...newPaImages.map(p => ({ id: p.id, filename: p.filename }))],
        }
      }

      const jsonCategory = editKind === 'watercolor' ? 'watercolors' : editKind === 'encaustic' ? 'encaustics' : editKind === 'oil' ? 'oils' : editKind === 'digital' ? 'digitals' : draft.photoCategory
      const apiType = editKind === 'photo' ? 'photo' : editKind === 'process' ? 'artProcess' : 'fineArt'
      const res = await fetch('/api/admin/products', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: apiType, action: editMode, category: editKind === 'process' ? undefined : jsonCategory, id, data: itemData }),
      })
      if (!res.ok) throw new Error('Save failed')

      if (editKind === 'photo') {
        const freshPhotos = await fetch('/api/admin/photos-list').then(r => r.json())
        setData(prev => ({ ...prev, photos: freshPhotos }))
      } else if (editKind === 'watercolor') {
        setData(prev => ({ ...prev, fineArt: { ...prev.fineArt, works: { ...prev.fineArt.works, watercolors: editMode === 'add' ? [...prev.fineArt.works.watercolors, itemData as BasicWork] : prev.fineArt.works.watercolors.map(w => w.id === id ? itemData as BasicWork : w) } } }))
      } else if (editKind === 'encaustic') {
        setData(prev => ({ ...prev, fineArt: { ...prev.fineArt, works: { ...prev.fineArt.works, encaustics: editMode === 'add' ? [...prev.fineArt.works.encaustics, itemData as BasicWork] : prev.fineArt.works.encaustics.map(w => w.id === id ? itemData as BasicWork : w) } } }))
      } else if (editKind === 'oil') {
        setData(prev => ({ ...prev, fineArt: { ...prev.fineArt, works: { ...prev.fineArt.works, oils: editMode === 'add' ? [...prev.fineArt.works.oils, itemData as OilWork] : prev.fineArt.works.oils.map(w => w.id === id ? itemData as OilWork : w) } } }))
      } else if (editKind === 'digital') {
        setData(prev => ({ ...prev, fineArt: { ...prev.fineArt, works: { ...prev.fineArt.works, digitals: editMode === 'add' ? [...prev.fineArt.works.digitals, itemData as BasicWork] : prev.fineArt.works.digitals.map(w => w.id === id ? itemData as BasicWork : w) } } }))
      } else if (editKind === 'process') {
        setData(prev => ({
          ...prev,
          process: editMode === 'add'
            ? [...prev.process, itemData as ProcessEntry]
            : prev.process.map(p => p.id === id ? itemData as ProcessEntry : p)
        }))
      }
      closeModal(); showSuccess('Changes saved!')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally { setSaving(false) }
  }

  // ── Delete ──────────────────────────────────────────────────────────────────

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await fetch('/api/admin/products', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: deleteTarget.type, action: 'delete', category: deleteTarget.category, id: deleteTarget.id }),
      })
      if (deleteTarget.type === 'photo') {
        setData(prev => {
          const photos = { ...prev.photos.photos }
          const cat = deleteTarget.category!
          photos[cat] = (photos[cat] || []).filter(p => p.id !== deleteTarget.id)
          return { ...prev, photos: { ...prev.photos, photos } }
        })
      } else if (deleteTarget.type === 'photoCategory') {
        setData(prev => {
          const categories = { ...prev.photos.categories }
          const photos = { ...prev.photos.photos }
          delete categories[deleteTarget.id]
          delete photos[deleteTarget.id]
          return { ...prev, photos: { ...prev.photos, categories, photos } }
        })
      } else if (deleteTarget.type === 'fineArt') {
        const cat = deleteTarget.category as 'watercolors' | 'encaustics' | 'oils' | 'digitals'
        setData(prev => ({ ...prev, fineArt: { ...prev.fineArt, works: { ...prev.fineArt.works, [cat]: prev.fineArt.works[cat].filter(w => w.id !== deleteTarget.id) } } }))
      } else if (deleteTarget.type === 'sticker') {
        setData(prev => ({ ...prev, stickers: prev.stickers.filter(s => s !== deleteTarget.id) }))
      } else if (deleteTarget.type === 'artProcess') {
        setData(prev => ({ ...prev, process: prev.process.filter(p => p.id !== deleteTarget.id) }))
      }
      setDeleteTarget(null); showSuccess('Deleted.')
    } finally { setDeleting(false) }
  }

  // ── Reorder (drag & drop) ───────────────────────────────────────────────────

  async function saveReorder(type: 'fineArt' | 'photo' | 'artProcess', category: string, ids: string[]) {
    await fetch('/api/admin/products', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, action: 'reorder', category, data: { ids } }),
    })
  }

  function makeDragHandlers<T extends { id: string }>(
    items: T[],
    onReorder: (reordered: T[]) => void,
    type: 'fineArt' | 'photo' | 'artProcess',
    category: string
  ) {
    return {
      onDragStart: (i: number) => { dragSrcRef.current = i },
      onDragOver: (e: React.DragEvent, i: number) => { e.preventDefault(); setDragOverIdx(i) },
      onDragLeave: () => setDragOverIdx(null),
      onDrop: (i: number) => {
        const src = dragSrcRef.current
        if (src === null || src === i) { setDragOverIdx(null); return }
        const next = [...items]
        const [moved] = next.splice(src, 1)
        next.splice(i, 0, moved)
        onReorder(next)
        saveReorder(type, category, next.map(x => x.id))
        dragSrcRef.current = null; setDragOverIdx(null)
      },
    }
  }

  // ── Category management ──────────────────────────────────────────────────────

  async function handleCreateCategory() {
    const label = newCatLabel.trim()
    if (!label) return
    const slug = toSlug(label)
    setCreatingCat(true)
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'photoCategory', action: 'add', data: { slug, label, description: newCatDesc.trim() } }),
      })
      if (!res.ok) { const j = await res.json(); throw new Error(j.error || 'Failed'); }
      setData(prev => ({
        ...prev,
        photos: {
          ...prev.photos,
          categories: { ...prev.photos.categories, [slug]: { label, description: newCatDesc.trim() } },
          photos: { ...prev.photos.photos, [slug]: [] },
        },
      }))
      setNewCatLabel(''); setNewCatDesc(''); setShowNewCat(false)
      showSuccess(`"${label}" category created!`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally { setCreatingCat(false) }
  }

  // ── Pricing ─────────────────────────────────────────────────────────────────

  async function savePricing() {
    setSaving(true)
    const res = await fetch('/api/admin/products', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'printConfig', data: { printSizes } }),
    })
    if (res.ok) { setPricingDirty(false); setData(prev => ({ ...prev, printConfig: { ...prev.printConfig, printSizes } })); showSuccess('Pricing saved!') }
    setSaving(false)
  }

  // ── Shared UI helpers ────────────────────────────────────────────────────────

  const inp = (value: string, onChange: (v: string) => void, placeholder = '', type = 'text') => (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white" />
  )

  const textarea = (value: string, onChange: (v: string) => void) => (
    <textarea value={value} onChange={e => onChange(e.target.value)} rows={3}
      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none bg-white" />
  )

  const toggle = (on: boolean, onClick: () => void, label: string) => (
    <button type="button" onClick={onClick} className="flex items-center gap-2.5 group">
      <div className={`relative w-10 h-5 rounded-full transition-colors ${on ? 'bg-amber-500' : 'bg-gray-200'}`}>
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-5' : ''}`} />
      </div>
      <span className="text-sm text-gray-700">{label}</span>
    </button>
  )

  // ── Tab content ──────────────────────────────────────────────────────────────

  function PhotographyTab() {
    return (
      <div className="space-y-6">
        {/* Pricing */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Print Pricing</h2>
              <p className="text-xs text-gray-400 mt-0.5">Applies to all photography prints</p>
            </div>
            {pricingDirty && (
              <button onClick={savePricing} disabled={saving}
                className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-60">
                {saving ? 'Saving…' : 'Save Pricing'}
              </button>
            )}
          </div>
          <div className="px-6 py-4 space-y-3">
            {printSizes.map((size, i) => (
              <div key={size.label} className="flex items-center gap-4">
                <span className="text-sm text-gray-700 w-20 font-medium">{size.label}</span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input type="number" value={size.price}
                    onChange={e => { const updated = printSizes.map((s, j) => j === i ? { ...s, price: parseInt(e.target.value) || 0 } : s); setPrintSizes(updated); setPricingDirty(true) }}
                    className="border border-gray-200 rounded-lg pl-7 pr-3 py-2 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white" />
                </div>
                <span className="text-xs text-gray-400">per print</span>
              </div>
            ))}
          </div>
        </div>

        {/* Photos by category */}
        {Object.entries(data.photos.categories).map(([catSlug, cat]) => {
          const photos = data.photos.photos[catSlug] || []
          const dh = makeDragHandlers<Photo>(
            photos,
            reordered => setData(prev => ({ ...prev, photos: { ...prev.photos, photos: { ...prev.photos.photos, [catSlug]: reordered } } })),
            'photo', catSlug
          )
          return (
            <div key={catSlug} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">{cat.label}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{photos.length} photo{photos.length !== 1 ? 's' : ''} · drag to reorder</p>
                </div>
                <div className="flex items-center gap-2">
                  {photos.length === 0 && (
                    <button
                      onClick={() => setDeleteTarget({ type: 'photoCategory', id: catSlug, label: cat.label })}
                      className="text-xs text-red-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 px-2.5 py-1.5 rounded-lg transition-colors"
                      title="Delete category">
                      Delete
                    </button>
                  )}
                  <button onClick={() => openAdd('photo', catSlug)}
                    className="flex items-center gap-1.5 text-sm text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-lg transition-colors font-medium">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add Photo
                  </button>
                </div>
              </div>
              <div className="p-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {photos.map((photo, i) => (
                  <div key={photo.id} draggable
                    onDragStart={() => dh.onDragStart(i)}
                    onDragOver={e => dh.onDragOver(e, i)}
                    onDragLeave={dh.onDragLeave}
                    onDrop={() => dh.onDrop(i)}
                    className={`group relative cursor-grab active:cursor-grabbing rounded-xl overflow-hidden border-2 transition-all ${dragOverIdx === i ? 'border-amber-400 scale-95' : 'border-transparent'}`}>
                    <div className="aspect-square bg-gray-100 overflow-hidden">
                      <img src={imgUrl('photo', catSlug, photo.filename)} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors rounded-xl flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <button onClick={() => openEdit('photo', photo, catSlug)} className="bg-white text-gray-800 text-xs font-medium px-2.5 py-1.5 rounded-lg hover:bg-amber-50 transition-colors">Edit</button>
                      <button onClick={() => setDeleteTarget({ type: 'photo', id: photo.id, category: catSlug, label: photo.title })} className="bg-white text-red-500 text-xs font-medium px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors">Del</button>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1 px-0.5 truncate leading-tight">{photo.title}</p>
                  </div>
                ))}
                {photos.length === 0 && (
                  <div className="col-span-full text-center py-10 text-gray-300">
                    <svg className="w-10 h-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p className="text-sm">No photos yet — click Add Photo</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* New photo category button — lives below all existing categories so it's obvious what it adds */}
        <button onClick={() => { setShowNewCat(true); setNewCatLabel(''); setNewCatDesc(''); setError('') }}
          className="w-full flex items-center justify-center gap-2 text-sm text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-dashed border-indigo-300 px-4 py-4 rounded-2xl transition-colors font-medium">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Photo Category
        </button>
      </div>
    )
  }

  function WorksTab({ category, kind }: { category: 'watercolors' | 'encaustics'; kind: ModalKind }) {
    const works = data.fineArt.works[category] || []
    const label = category === 'watercolors' ? 'Watercolor' : 'Encaustic'
    const dh = makeDragHandlers<BasicWork>(
      works,
      reordered => setData(prev => ({ ...prev, fineArt: { ...prev.fineArt, works: { ...prev.fineArt.works, [category]: reordered } } })),
      'fineArt', category
    )
    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">{category === 'watercolors' ? 'Watercolors' : 'Encaustics'}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{works.length} works · drag to reorder</p>
          </div>
          <button onClick={() => openAdd(kind)}
            className="flex items-center gap-1.5 text-sm text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-lg transition-colors font-medium">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add {label}
          </button>
        </div>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {works.map((work, i) => (
            <div key={work.id} draggable
              onDragStart={() => dh.onDragStart(i)}
              onDragOver={e => dh.onDragOver(e, i)}
              onDragLeave={dh.onDragLeave}
              onDrop={() => dh.onDrop(i)}
              className={`group relative cursor-grab active:cursor-grabbing rounded-xl border-2 overflow-hidden transition-all ${dragOverIdx === i ? 'border-amber-400 scale-95' : 'border-transparent'}`}>
              <div className="aspect-square bg-gray-100 overflow-hidden">
                <img src={imgUrl(kind, category, work.filename)} alt={work.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
              </div>
              {work.available && (
                <div className="absolute top-2 left-2">
                  <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold">For Sale</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors rounded-xl flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button onClick={() => openEdit(kind, work)} className="bg-white text-gray-800 text-xs font-medium px-2.5 py-1.5 rounded-lg hover:bg-amber-50 transition-colors">Edit</button>
                <button onClick={() => setDeleteTarget({ type: 'fineArt', id: work.id, category, label: work.title })} className="bg-white text-red-500 text-xs font-medium px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors">Del</button>
              </div>
              <div className="p-2">
                <p className="text-xs text-gray-800 font-medium truncate">{work.title}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {work.originalSize && <span>{work.originalSize}</span>}
                  {work.price ? <span className={work.originalSize ? ' · ' : ''}>${work.price}</span> : work.available ? <span className={work.originalSize ? ' · ' : ''}>Inquire</span> : null}
                </p>
              </div>
            </div>
          ))}
          {works.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-300">
              <svg className="w-10 h-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <p className="text-sm">No works yet — click Add {label}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  function OilsTab() {
    const oils = data.fineArt.works.oils || []
    const dh = makeDragHandlers<OilWork>(
      oils,
      reordered => setData(prev => ({ ...prev, fineArt: { ...prev.fineArt, works: { ...prev.fineArt.works, oils: reordered } } })),
      'fineArt', 'oils'
    )
    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Oil Paintings</h2>
            <p className="text-xs text-gray-400 mt-0.5">{oils.length} paintings · drag to reorder</p>
          </div>
          <button onClick={() => openAdd('oil')}
            className="flex items-center gap-1.5 text-sm text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-lg transition-colors font-medium">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Painting
          </button>
        </div>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {oils.map((oil, i) => (
            <div key={oil.id} draggable
              onDragStart={() => dh.onDragStart(i)}
              onDragOver={e => dh.onDragOver(e, i)}
              onDragLeave={dh.onDragLeave}
              onDrop={() => dh.onDrop(i)}
              className={`group relative cursor-grab active:cursor-grabbing rounded-xl border-2 overflow-hidden transition-all ${dragOverIdx === i ? 'border-amber-400 scale-95' : 'border-transparent'}`}>
              <div className="aspect-square bg-gray-100 overflow-hidden">
                <img src={imgUrl('oil', 'oils', oil.filename)} alt={oil.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
              </div>
              {oil.award && (
                <div className="absolute top-2 left-2">
                  <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    Award
                  </span>
                </div>
              )}
              {oil.available && !oil.award && (
                <div className="absolute top-2 left-2">
                  <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold">For Sale</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors rounded-xl flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button onClick={() => openEdit('oil', oil)} className="bg-white text-gray-800 text-xs font-medium px-2.5 py-1.5 rounded-lg hover:bg-amber-50 transition-colors">Edit</button>
                <button onClick={() => setDeleteTarget({ type: 'fineArt', id: oil.id, category: 'oils', label: oil.title })} className="bg-white text-red-500 text-xs font-medium px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors">Del</button>
              </div>
              <div className="p-2">
                <p className="text-xs text-gray-800 font-medium truncate">{oil.title}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {oil.originalPrice ? `$${oil.originalPrice} original` : 'Inquiry only'}
                  {oil.reprintAvailable && ` · $${oil.reprintPrice} reprint`}
                </p>
                {oil.pleinAirImages.length > 0 && <p className="text-[10px] text-blue-400">{oil.pleinAirImages.length} process img{oil.pleinAirImages.length !== 1 ? 's' : ''}</p>}
              </div>
            </div>
          ))}
          {oils.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-300">
              <svg className="w-10 h-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <p className="text-sm">No paintings yet — click Add Painting</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  function StickersTab() {
    async function saveStickerReorder(filenames: string[]) {
      await fetch('/api/admin/products', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'sticker', action: 'reorder', data: { ids: filenames } }),
      })
    }
    function stickerDragStart(i: number) { dragSrcRef.current = i }
    function stickerDragOver(e: React.DragEvent, i: number) { e.preventDefault(); setDragOverIdx(i) }
    function stickerDragLeave() { setDragOverIdx(null) }
    function stickerDrop(i: number) {
      const src = dragSrcRef.current
      if (src === null || src === i) { setDragOverIdx(null); return }
      const next = [...data.stickers]
      const [moved] = next.splice(src, 1)
      next.splice(i, 0, moved)
      setData(prev => ({ ...prev, stickers: next }))
      saveStickerReorder(next)
      dragSrcRef.current = null; setDragOverIdx(null)
    }
    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Stickers</h2>
            <p className="text-xs text-gray-400 mt-0.5">{data.stickers.length} designs · sold via Sticker Mule · drag to reorder</p>
          </div>
          <button onClick={() => openAdd('sticker')}
            className="flex items-center gap-1.5 text-sm text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-lg transition-colors font-medium">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Sticker
          </button>
        </div>
        <div className="p-4 grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-3">
          {data.stickers.map((s, i) => (
            <div key={s} draggable
              onDragStart={() => stickerDragStart(i)}
              onDragOver={e => stickerDragOver(e, i)}
              onDragLeave={stickerDragLeave}
              onDrop={() => stickerDrop(i)}
              className={`group relative cursor-grab active:cursor-grabbing transition-all ${dragOverIdx === i ? 'ring-2 ring-amber-400 rounded-xl' : ''}`}>
              <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center">
                <img src={`/stickers/${s}?v=5`} alt={s} className="w-full h-full object-contain p-2" loading="lazy" />
              </div>
              <button onClick={() => setDeleteTarget({ type: 'sticker', id: s, label: s })}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs leading-none opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">×</button>
              <p className="text-[10px] text-gray-400 mt-1 truncate">{s.replace(/\.[^.]+$/, '')}</p>
            </div>
          ))}
          {data.stickers.length === 0 && (
            <div className="col-span-full text-center py-10 text-gray-300">
              <p className="text-sm">No stickers yet</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  function ProcessTab() {
    const entries = data.process || []
    const dh = makeDragHandlers<ProcessEntry>(
      entries,
      reordered => setData(prev => ({ ...prev, process: reordered })),
      'artProcess', 'process'
    )
    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Art Process</h2>
            <p className="text-xs text-gray-400 mt-0.5">{entries.length} entries · drag to reorder · shown at /process</p>
          </div>
          <button onClick={() => openAdd('process')}
            className="flex items-center gap-1.5 text-sm text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-lg transition-colors font-medium">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Entry
          </button>
        </div>
        <div className="p-4 space-y-3">
          {entries.map((entry, i) => (
            <div key={entry.id} draggable
              onDragStart={() => dh.onDragStart(i)}
              onDragOver={e => dh.onDragOver(e, i)}
              onDragLeave={dh.onDragLeave}
              onDrop={() => dh.onDrop(i)}
              className={`flex gap-4 p-4 rounded-xl border-2 cursor-grab active:cursor-grabbing transition-all ${dragOverIdx === i ? 'border-amber-400 bg-amber-50' : 'border-gray-100 bg-gray-50'}`}>
              {entry.images[0] && (
                <img src={`/fine-art/process/${entry.images[0].filename}?v=5`} alt={entry.title}
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0" loading="lazy" />
              )}
              {!entry.images[0] && (
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{entry.title}</p>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{entry.description}</p>
                <p className="text-[10px] text-blue-400 mt-1">{entry.images.length} image{entry.images.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => openEdit('process', entry)} className="text-xs text-gray-600 bg-white border border-gray-200 hover:bg-amber-50 hover:border-amber-300 px-2.5 py-1.5 rounded-lg transition-colors">Edit</button>
                <button onClick={() => setDeleteTarget({ type: 'artProcess', id: entry.id, label: entry.title })} className="text-xs text-red-400 bg-white border border-gray-200 hover:bg-red-50 hover:border-red-300 px-2.5 py-1.5 rounded-lg transition-colors">Del</button>
              </div>
            </div>
          ))}
          {entries.length === 0 && (
            <div className="text-center py-12 text-gray-300">
              <svg className="w-10 h-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <p className="text-sm">No entries yet — click Add Entry to share your artistic process</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  function DigitalTab() {
    const works = data.fineArt.works.digitals || []
    const dh = makeDragHandlers<BasicWork>(
      works,
      reordered => setData(prev => ({ ...prev, fineArt: { ...prev.fineArt, works: { ...prev.fineArt.works, digitals: reordered } } })),
      'fineArt', 'digitals'
    )
    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Digital Design & Illustration</h2>
            <p className="text-xs text-gray-400 mt-0.5">{works.length} works · drag to reorder</p>
          </div>
          <button onClick={() => openAdd('digital')}
            className="flex items-center gap-1.5 text-sm text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-lg transition-colors font-medium">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Design
          </button>
        </div>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {works.map((work, i) => (
            <div key={work.id} draggable
              onDragStart={() => dh.onDragStart(i)}
              onDragOver={e => dh.onDragOver(e, i)}
              onDragLeave={dh.onDragLeave}
              onDrop={() => dh.onDrop(i)}
              className={`group relative cursor-grab active:cursor-grabbing rounded-xl border-2 overflow-hidden transition-all ${dragOverIdx === i ? 'border-amber-400 scale-95' : 'border-transparent'}`}>
              <div className="aspect-square bg-gray-100 overflow-hidden">
                <img src={imgUrl('digital', 'digitals', work.filename)} alt={work.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors rounded-xl flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button onClick={() => openEdit('digital', work)} className="bg-white text-gray-800 text-xs font-medium px-2.5 py-1.5 rounded-lg hover:bg-amber-50 transition-colors">Edit</button>
                <button onClick={() => setDeleteTarget({ type: 'fineArt', id: work.id, category: 'digitals', label: work.title })} className="bg-white text-red-500 text-xs font-medium px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors">Del</button>
              </div>
              <div className="p-2">
                <p className="text-xs text-gray-800 font-medium truncate">{work.title}</p>
                {work.originalSize && <p className="text-[10px] text-gray-400 mt-0.5">{work.originalSize}</p>}
              </div>
            </div>
          ))}
          {works.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-300">
              <svg className="w-10 h-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <p className="text-sm">No designs yet — click Add Design</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  function HashtagsTab() {
    const typeLabel: Record<string, string> = {
      watercolor: 'Watercolors', encaustic: 'Encaustics', oil: 'Oil Paintings',
      photo: 'Photography', sticker: 'Stickers', digital: 'Digital',
    }
    const grouped: Record<string, HashtagItem[]> = {}
    if (hashItems) {
      hashItems.forEach(item => {
        if (!grouped[item.type]) grouped[item.type] = []
        grouped[item.type].push(item)
      })
    }

    async function generateAll() {
      setHashGenerating(true)
      try {
        const res = await fetch('/api/admin/hashtags', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'generate-all' }),
        })
        const d = await res.json()
        setHashItems(d.items)
      } finally { setHashGenerating(false) }
    }

    async function saveTags(item: HashtagItem) {
      setHashSavingId(item.id)
      try {
        await fetch('/api/admin/hashtags', {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: item.type, id: item.id, tags: hashEditTags }),
        })
        setHashItems(prev => prev?.map(i => i.id === item.id ? { ...i, tags: hashEditTags } : i) || null)
        setHashEditId(null)
      } finally { setHashSavingId(null) }
    }

    function copyTags(tags: string[], id: string) {
      navigator.clipboard.writeText(tags.join(' '))
      setHashCopied(id)
      setTimeout(() => setHashCopied(null), 2000)
    }

    function copyAll() {
      if (!hashItems) return
      const all = [...new Set(hashItems.flatMap(i => i.tags))].join(' ')
      navigator.clipboard.writeText(all)
      setHashCopied('all')
      setTimeout(() => setHashCopied(null), 2000)
    }

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Hashtags</h2>
            <p className="text-xs text-gray-400 mt-0.5">5 per product · for social media · not shown on site</p>
          </div>
          <div className="flex gap-2">
            <button onClick={copyAll}
              className="text-xs border border-gray-200 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              {hashCopied === 'all' ? 'Copied!' : 'Copy All'}
            </button>
            <button onClick={generateAll} disabled={hashGenerating}
              className="text-xs bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-60 font-medium">
              {hashGenerating ? 'Generating…' : 'Generate All'}
            </button>
          </div>
        </div>
        {!hashItems ? (
          <div className="text-center py-16 text-gray-300 text-sm">Loading…</div>
        ) : (
          Object.entries(grouped).map(([type, typeItems]) => (
            <div key={type} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800 text-sm">
                  {typeLabel[type] || type} <span className="font-normal text-gray-400">({typeItems.length})</span>
                </h3>
              </div>
              <div className="divide-y divide-gray-50">
                {typeItems.map(item => (
                  <div key={item.id} className="px-4 py-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      <img src={imgUrl(item.type, item.category || '', item.filename)}
                        alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-sm text-gray-700 w-32 flex-shrink-0 truncate">{item.title}</p>
                    <div className="flex-1 min-w-0">
                      {hashEditId === item.id ? (
                        <input
                          value={hashEditTags.join(' ')}
                          onChange={e => setHashEditTags(e.target.value.split(/\s+/).filter(Boolean))}
                          className="w-full text-xs border border-amber-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono"
                          autoFocus
                        />
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {item.tags.length === 0
                            ? <span className="text-xs text-gray-300 italic">No tags — click Generate All</span>
                            : item.tags.map(tag => (
                              <span key={tag} className="text-[11px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-mono">{tag}</span>
                            ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {hashEditId === item.id ? (
                        <>
                          <button onClick={() => saveTags(item)} disabled={hashSavingId === item.id}
                            className="text-xs bg-emerald-500 text-white px-2.5 py-1.5 rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-60">
                            {hashSavingId === item.id ? '…' : 'Save'}
                          </button>
                          <button onClick={() => setHashEditId(null)}
                            className="text-xs border border-gray-200 text-gray-500 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setHashEditId(item.id); setHashEditTags(item.tags) }}
                            className="text-xs border border-gray-200 text-gray-500 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                            Edit
                          </button>
                          <button onClick={() => copyTags(item.tags, item.id)}
                            className="text-xs border border-gray-200 text-gray-500 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                            {hashCopied === item.id ? '✓' : 'Copy'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    )
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  const TABS: { key: Tab; label: string; count?: number }[] = [
    { key: 'photography', label: 'Photography', count: Object.values(data.photos.photos).flat().length },
    { key: 'watercolors', label: 'Watercolors', count: data.fineArt.works.watercolors.length },
    { key: 'encaustics', label: 'Encaustics', count: data.fineArt.works.encaustics.length },
    { key: 'oils', label: 'Oils', count: data.fineArt.works.oils.length },
    { key: 'stickers', label: 'Stickers', count: data.stickers.length },
    { key: 'digital', label: 'Digital', count: data.fineArt.works.digitals.length },
    { key: 'process', label: 'Process', count: (data.process || []).length },
    { key: 'hashtags', label: 'Hashtags' },
  ]

  return (
    <AdminLayout>
      <Head><title>Products | OBG Admin</title></Head>

      {/* Page header */}
      <div className="px-6 sm:px-8 pt-8 pb-6 border-b border-gray-200" style={{ background: '#FAF8F5' }}>
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <p className="text-sm text-gray-500 mt-1">Manage artwork, photos, and pricing · drag cards to reorder</p>

      </div>

      {/* Success toast */}
      {successMsg && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-pulse">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          {successMsg}
        </div>
      )}

      <div className="px-6 sm:px-8 py-6">
        {/* Tab bar */}
        <div className="flex gap-1 mb-6 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                tab === t.key ? 'bg-gray-900 text-white shadow-sm' : 'bg-white text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-300'
              }`}>
              {t.label}
              {t.count !== undefined && (
                <span className={`text-[11px] rounded-full px-1.5 py-0.5 font-semibold leading-none ${tab === t.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* render tabs as plain calls to avoid remount on each keystroke */}
        {tab === 'photography' && PhotographyTab()}
        {tab === 'watercolors' && WorksTab({ category: 'watercolors', kind: 'watercolor' })}
        {tab === 'encaustics' && WorksTab({ category: 'encaustics', kind: 'encaustic' })}
        {tab === 'oils' && OilsTab()}
        {tab === 'stickers' && StickersTab()}
        {tab === 'digital' && DigitalTab()}
        {tab === 'process' && ProcessTab()}
        {tab === 'hashtags' && HashtagsTab()}
      </div>

      {/* ── New Category modal ──────────────────────────────────────────────── */}
      {showNewCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowNewCat(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">New Photo Category</h2>
              <button onClick={() => setShowNewCat(false)} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-colors text-lg">×</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category Name <span className="text-red-400">*</span></label>
                <input
                  value={newCatLabel}
                  onChange={e => setNewCatLabel(e.target.value)}
                  placeholder="e.g. Italy, Macro, Birds"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                  onKeyDown={e => e.key === 'Enter' && handleCreateCategory()}
                />
                {newCatLabel.trim() && (
                  <p className="text-xs text-gray-400 mt-1">URL slug: <span className="font-mono">/photos/{toSlug(newCatLabel)}</span></p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description <span className="font-normal text-gray-400">(shown on the gallery page)</span></label>
                <textarea
                  value={newCatDesc}
                  onChange={e => setNewCatDesc(e.target.value)}
                  rows={2}
                  placeholder="A short description of this collection…"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none bg-white"
                />
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={handleCreateCategory} disabled={creatingCat || !newCatLabel.trim()}
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-60 text-sm">
                {creatingCat ? 'Creating…' : 'Create Category'}
              </button>
              <button onClick={() => setShowNewCat(false)} className="px-5 py-2.5 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors text-sm font-medium">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit / Add modal ─────────────────────────────────────────────────── */}
      {editKind && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">

            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="font-semibold text-gray-900 text-base">
                {editMode === 'add' ? 'Add' : 'Edit'}{' '}
                {{ photo: 'Photo', watercolor: 'Watercolor', encaustic: 'Encaustic', oil: 'Oil Painting', sticker: 'Sticker', digital: 'Digital Design', process: 'Art Process Entry' }[editKind]}
              </h2>
              <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-colors text-lg">×</button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Image upload — drag and drop supported — hidden for process entries */}
              {editKind !== 'process' && <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image {editMode === 'add' && editKind !== 'sticker' && <span className="text-red-400">*</span>}
                  {editMode === 'edit' && <span className="font-normal text-gray-400 text-xs ml-1">(drag a new file to replace)</span>}
                </label>
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragOverUpload(true) }}
                  onDragLeave={() => setDragOverUpload(false)}
                  onDrop={handleUploadDrop}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${dragOverUpload ? 'border-amber-400 bg-amber-50 scale-[1.02]' : 'border-gray-200 hover:border-amber-300 hover:bg-gray-50'}`}
                >
                  {uploadPreview ? (
                    <img src={uploadPreview} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain" />
                  ) : (
                    <div className="py-8">
                      <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm text-gray-400 font-medium">Drag & drop or click to upload</p>
                      <p className="text-xs text-gray-300 mt-1">JPG, PNG, WebP · watermark applied automatically</p>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
              </div>}

              {editKind !== 'sticker' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Title <span className="text-red-400">*</span></label>
                    {inp(draft.title, v => setDraft(d => ({ ...d, title: v })), 'Artwork title')}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                    {textarea(draft.description, v => setDraft(d => ({ ...d, description: v })))}
                  </div>

                  {/* Process entry images */}
                  {editKind === 'process' && (
                    <div className="border-t border-gray-100 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-gray-700">Images <span className="text-red-400">*</span></p>
                        <button type="button" onClick={() => paFileRef.current?.click()}
                          className="text-xs text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 px-2.5 py-1 rounded-lg transition-colors">
                          + Add Images
                        </button>
                      </div>
                      <input ref={paFileRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePaFileSelect} />
                      <p className="text-xs text-gray-400 mb-3">Add photos showing this stage of the artistic process.</p>
                      <div className="grid grid-cols-4 gap-2">
                        {paItems.map(pa => (
                          <div key={pa.id} className="relative group">
                            <img src={`/fine-art/process/${pa.filename}?v=5`} alt={pa.id} className="aspect-square object-cover rounded-lg w-full" loading="lazy" />
                            <button type="button" onClick={() => setPaItems(prev => prev.filter(p => p.id !== pa.id))}
                              className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-5 h-5 text-xs leading-none opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">×</button>
                          </div>
                        ))}
                        {paUploads.map((pa, i) => (
                          <div key={i} className="relative group">
                            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                              <span className="text-[10px] text-gray-400 text-center p-1">{pa.name}</span>
                            </div>
                            <button type="button" onClick={() => setPaUploads(prev => prev.filter((_, j) => j !== i))}
                              className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-5 h-5 text-xs leading-none flex items-center justify-center">×</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {editKind === 'photo' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                      <select value={draft.photoCategory} onChange={e => setDraft(d => ({ ...d, photoCategory: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white">
                        {Object.entries(data.photos.categories).map(([slug, cat]) => (
                          <option key={slug} value={slug}>{cat.label}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {(editKind === 'watercolor' || editKind === 'encaustic' || editKind === 'oil') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Original Size</label>
                      {inp(draft.originalSize, v => setDraft(d => ({ ...d, originalSize: v })), 'e.g. 9" × 12"')}
                    </div>
                  )}
                  {editKind === 'digital' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Subtitle</label>
                        {inp(draft.originalSize, v => setDraft(d => ({ ...d, originalSize: v })), 'e.g. Logo Design, Winning Poster Design')}
                      </div>
                      <div className="border-t border-gray-100 pt-4 space-y-3">
                        <p className="text-sm font-semibold text-gray-700">External Link <span className="font-normal text-gray-400">(optional — shown as a button in the popup)</span></p>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1.5">Button label</label>
                          {inp(draft.awardTitle, v => setDraft(d => ({ ...d, awardTitle: v })), 'e.g. View on Leimert Park Jazz Festival')}
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1.5">URL</label>
                          {inp(draft.awardUrl, v => setDraft(d => ({ ...d, awardUrl: v })), 'https://')}
                        </div>
                      </div>
                    </>
                  )}

                  {(editKind === 'watercolor' || editKind === 'encaustic' || editKind === 'oil') && (
                    <div>{toggle(draft.available, () => setDraft(d => ({ ...d, available: !d.available })), draft.available ? 'Available for sale' : 'Not currently for sale')}</div>
                  )}

                  {(editKind === 'watercolor' || editKind === 'encaustic') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Price <span className="font-normal text-gray-400 text-xs">(leave blank = "Inquire for price")</span>
                      </label>
                      <div className="relative w-36">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                        <input type="number" value={draft.price} onChange={e => setDraft(d => ({ ...d, price: e.target.value }))}
                          placeholder="450"
                          className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white" />
                      </div>
                    </div>
                  )}

                  {/* Archival reprints — watercolors & encaustics */}
                  {(editKind === 'watercolor' || editKind === 'encaustic') && (
                    <div className="border-t border-gray-100 pt-4 space-y-3">
                      <p className="text-sm font-semibold text-gray-700">Archival Reprints <span className="font-normal text-gray-400">(optional)</span></p>
                      {toggle(draft.reprintAvailable, () => setDraft(d => ({ ...d, reprintAvailable: !d.reprintAvailable })), 'Archival reprints available')}
                      {draft.reprintAvailable && (
                        <>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1.5">Printed on (medium)</label>
                            {inp(draft.reprintMedium, v => setDraft(d => ({ ...d, reprintMedium: v })), 'e.g. 300lb cold-press watercolor paper')}
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1.5">Reprint price <span className="font-normal text-gray-400">(blank = inquire)</span></label>
                            <div className="relative w-36">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                              <input type="number" value={draft.reprintPrice} onChange={e => setDraft(d => ({ ...d, reprintPrice: e.target.value }))}
                                placeholder="150"
                                className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white" />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Process images/videos — watercolors & encaustics */}
                  {(editKind === 'watercolor' || editKind === 'encaustic') && (
                    <div className="border-t border-gray-100 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-gray-700">In-Process Images / Videos <span className="font-normal text-gray-400">(optional)</span></p>
                        <button type="button" onClick={() => paFileRef.current?.click()}
                          className="text-xs text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 px-2.5 py-1 rounded-lg transition-colors">
                          + Upload
                        </button>
                      </div>
                      <input ref={paFileRef} type="file" accept="image/*,video/mp4,video/quicktime,video/webm" multiple className="hidden" onChange={handlePaFileSelect} />
                      <p className="text-xs text-gray-400 mb-3">Images: JPG/PNG. Videos: MP4/MOV/WebM under 100 MB.</p>
                      <div className="grid grid-cols-4 gap-2">
                        {paItems.map(pa => {
                          const ext = pa.filename.split('.').pop()?.toLowerCase() || ''
                          const isVid = ['mp4','mov','webm','m4v'].includes(ext)
                          const folder = editKind === 'watercolor' ? 'watercolors' : 'encaustics'
                          return (
                            <div key={pa.id} className="relative group">
                              {isVid ? (
                                <video src={`/fine-art/${folder}/${pa.filename}?v=5`} className="aspect-square object-cover rounded-lg w-full" muted />
                              ) : (
                                <img src={`/fine-art/${folder}/${pa.filename}?v=5`} alt={pa.title} className="aspect-square object-cover rounded-lg w-full" loading="lazy" />
                              )}
                              <button type="button" onClick={() => setPaItems(prev => prev.filter(p => p.id !== pa.id))}
                                className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-5 h-5 text-xs leading-none opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">×</button>
                            </div>
                          )
                        })}
                        {paUploads.map((pa, i) => (
                          <div key={i} className="relative group">
                            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                              <span className="text-[10px] text-gray-400 text-center p-1">{pa.name}</span>
                            </div>
                            <button type="button" onClick={() => setPaUploads(prev => prev.filter((_, j) => j !== i))}
                              className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-5 h-5 text-xs leading-none flex items-center justify-center">×</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {editKind === 'oil' && (
                    <>
                      <div className="border-t border-gray-100 pt-4 space-y-3">
                        <p className="text-sm font-semibold text-gray-700">Pricing</p>
                        <div className="flex items-center gap-3">
                          <label className="text-sm text-gray-600 w-28 flex-shrink-0">Original price</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                            <input type="number" value={draft.originalPrice} onChange={e => setDraft(d => ({ ...d, originalPrice: e.target.value }))} placeholder="950"
                              className="border border-gray-200 rounded-lg pl-7 pr-3 py-2 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white" />
                          </div>
                          <span className="text-xs text-gray-400">blank = inquiry only</span>
                        </div>
                        {toggle(draft.reprintAvailable, () => setDraft(d => ({ ...d, reprintAvailable: !d.reprintAvailable })), 'Reprints available')}
                        {draft.reprintAvailable && (
                          <>
                            <div>
                              <label className="block text-sm text-gray-600 mb-1.5">Printed on (medium)</label>
                              {inp(draft.reprintMedium, v => setDraft(d => ({ ...d, reprintMedium: v })), 'e.g. Archival watercolor paper · 11"×14"')}
                            </div>
                            <div className="flex items-center gap-3">
                              <label className="text-sm text-gray-600 w-28 flex-shrink-0">Reprint price</label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                                <input type="number" value={draft.reprintPrice} onChange={e => setDraft(d => ({ ...d, reprintPrice: e.target.value }))} placeholder="95"
                                  className="border border-gray-200 rounded-lg pl-7 pr-3 py-2 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white" />
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="border-t border-gray-100 pt-4 space-y-3">
                        <p className="text-sm font-semibold text-gray-700">Award <span className="font-normal text-gray-400">(optional)</span></p>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1.5">Award title</label>
                          {inp(draft.awardTitle, v => setDraft(d => ({ ...d, awardTitle: v })), 'e.g. Winner — 2024 Art Competition')}
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1.5">Award URL</label>
                          {inp(draft.awardUrl, v => setDraft(d => ({ ...d, awardUrl: v })), 'https://')}
                        </div>
                      </div>

                      <div className="border-t border-gray-100 pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-semibold text-gray-700">Process / Plein Air Images <span className="font-normal text-gray-400">(optional)</span></p>
                          <button type="button" onClick={() => paFileRef.current?.click()}
                            className="text-xs text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 px-2.5 py-1 rounded-lg transition-colors">
                            + Upload
                          </button>
                        </div>
                        <input ref={paFileRef} type="file" accept="image/*,video/mp4,video/quicktime,video/webm" multiple className="hidden" onChange={handlePaFileSelect} />
                        <div className="grid grid-cols-4 gap-2">
                          {paItems.map(pa => (
                            <div key={pa.id} className="relative group">
                              <img src={`/fine-art/oils/plein-air/${pa.filename}?v=5`} alt={pa.title} className="aspect-square object-cover rounded-lg w-full" loading="lazy" />
                              <button type="button" onClick={() => setPaItems(prev => prev.filter(p => p.id !== pa.id))}
                                className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-5 h-5 text-xs leading-none opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">×</button>
                            </div>
                          ))}
                          {paUploads.map((pa, i) => (
                            <div key={i} className="relative group">
                              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                                <span className="text-[10px] text-gray-400 text-center p-1">{pa.name}</span>
                              </div>
                              <button type="button" onClick={() => setPaUploads(prev => prev.filter((_, j) => j !== i))}
                                className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-5 h-5 text-xs leading-none flex items-center justify-center">×</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {error}
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-3 rounded-b-2xl">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-60 text-sm">
                {saving ? 'Saving…' : editMode === 'add' ? 'Add to Site' : 'Save Changes'}
              </button>
              <button onClick={closeModal} className="px-5 py-2.5 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors text-sm font-medium">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirm ──────────────────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h2 className="font-bold text-gray-900 text-center mb-1">Delete this item?</h2>
            <p className="text-sm text-gray-500 text-center mb-5"><strong>{deleteTarget.label}</strong> will be removed. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-60 text-sm">
                {deleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
              <button onClick={() => setDeleteTarget(null)} className="px-5 py-2.5 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors text-sm font-medium">
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
  const { prisma } = await import('../../lib/prisma')
  const [watercolors, encaustics, oils, digitals, photos, categories, printSizes, stickers, processEntries] = await Promise.all([
    prisma.fineArtWork.findMany({ where: { type: 'watercolor' }, include: { pleinAirImages: { orderBy: { sortOrder: 'asc' } } }, orderBy: { sortOrder: 'asc' } }),
    prisma.fineArtWork.findMany({ where: { type: 'encaustic' }, include: { pleinAirImages: { orderBy: { sortOrder: 'asc' } } }, orderBy: { sortOrder: 'asc' } }),
    prisma.fineArtWork.findMany({ where: { type: 'oil' }, include: { pleinAirImages: { orderBy: { sortOrder: 'asc' } } }, orderBy: { sortOrder: 'asc' } }),
    prisma.fineArtWork.findMany({ where: { type: 'digital' }, orderBy: { sortOrder: 'asc' } }),
    prisma.photo.findMany({ orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }] }),
    prisma.photoCategory.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.printSize.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.sticker.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.artProcess.findMany({ include: { images: { orderBy: { sortOrder: 'asc' } } }, orderBy: { sortOrder: 'asc' } }),
  ])

  const photosByCategory: Record<string, typeof photos> = {}
  for (const p of photos) {
    if (!photosByCategory[p.category]) photosByCategory[p.category] = []
    photosByCategory[p.category].push(p)
  }
  const photoCatMap: Record<string, { label: string; description: string }> = {}
  for (const c of categories) photoCatMap[c.slug] = { label: c.label, description: c.description }

  return {
    props: {
      initialData: {
        fineArt: {
          categories: {
            watercolors: { label: 'Watercolors', description: '' },
            encaustics: { label: 'Encaustics', description: '' },
            oils: { label: 'Oil Paintings', description: '' },
          },
          works: {
            watercolors: watercolors.map(w => ({ ...w, pleinAirImages: w.pleinAirImages.map(p => ({ id: p.id, filename: p.filename, title: p.title })) })),
            encaustics: encaustics.map(w => ({ ...w, pleinAirImages: w.pleinAirImages.map(p => ({ id: p.id, filename: p.filename, title: p.title })) })),
            oils: oils.map(w => ({ ...w, award: w.awardTitle ? { title: w.awardTitle, url: w.awardUrl || '' } : null, pleinAirImages: w.pleinAirImages.map(p => ({ id: p.id, filename: p.filename, title: p.title })) })),
            digitals: digitals.map(w => ({ id: w.id, filename: w.filename, title: w.title, originalSize: w.originalSize, description: w.description, available: false, price: null, awardTitle: w.awardTitle, awardUrl: w.awardUrl })),
          },
        },
        photos: { categories: photoCatMap, photos: photosByCategory },
        stickers: stickers.map(s => s.filename),
        printConfig: { printSizes },
        process: processEntries.map(e => ({ id: e.id, title: e.title, description: e.description, images: e.images.map(i => ({ id: i.id, filename: i.filename })) })),
      },
    },
  }
}
