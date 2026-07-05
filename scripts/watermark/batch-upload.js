/**
 * Batch upload all images to OBGillustrator.com
 *
 * Run with:
 *   ADMIN_SECRET=xxx SITE_URL=https://obgillustrator.com node batch-upload.js
 *
 * Or via Railway CLI (auto-injects env vars):
 *   railway run --service=photography node scripts/watermark/batch-upload.js
 *   (set SITE_URL separately, e.g. export SITE_URL=https://obgillustrator.com)
 */

const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const https = require('https')
const http = require('http')
const sharp = require('sharp')

sharp.cache(false)
sharp.concurrency(1)

// ── Config ──────────────────────────────────────────────────────────────────
const SITE_URL = (process.env.SITE_URL || 'https://obgillustrator.com').replace(/\/$/, '')
const ADMIN_SECRET = process.env.ADMIN_SECRET
const MAX_PX = 2400
const JPEG_QUALITY = 88

const DOWNLOADS = 'c:/Users/mason/Downloads'
const BASE = `${DOWNLOADS}`

const SOURCES = {
  nature: `${BASE}/Photography _Nature_HR-20260617T183541Z-3-001/Photography _Nature_HR`,
  sfbay: `${BASE}/San Francisco Bay-20260617T183544Z-3-001/San Francisco Bay`,
  watercolors: `${BASE}/Watercolors for OBGIllustrator.com-20260619T024200Z-3-001/Watercolors for OBGIllustrator.com`,
  encaustics: `${BASE}/Encaustic Gallery for OBGillustrator.com-20260620T190510Z-3-001/Encaustic Gallery for OBGillustrator.com`,
  oils: `${BASE}/Oil Paintings-20260621T000103Z-3-001/Oil Paintings`,
  stickers: `${BASE}/Stickers-20260621T000106Z-3-001/Stickers`,
  pleinair: `${BASE}/Plein Air and reprints-20260621T000110Z-3-001/Plein Air and reprints`,
}

// ── Auth ─────────────────────────────────────────────────────────────────────
function createToken() {
  if (!ADMIN_SECRET) throw new Error('ADMIN_SECRET env var not set')
  const expires = Date.now() + 7 * 24 * 60 * 60 * 1000
  const payload = `admin:${expires}`
  const sig = crypto.createHmac('sha256', ADMIN_SECRET).update(payload).digest('hex')
  return Buffer.from(`${payload}:${sig}`).toString('base64')
}

const COOKIE = `obg_admin=${createToken()}`

// ── HTTP helpers ─────────────────────────────────────────────────────────────
function request(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const full = `${SITE_URL}${urlPath}`
    const url = new URL(full)
    const lib = url.protocol === 'https:' ? https : http
    const opts = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        Cookie: COOKIE,
      },
      timeout: 120000,
    }
    const req = lib.request(opts, (res) => {
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }) }
        catch { resolve({ status: res.statusCode, body: data }) }
      })
    })
    req.on('error', reject)
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timed out')) })
    if (body) req.write(JSON.stringify(body))
    req.end()
  })
}

// ── Image helpers ────────────────────────────────────────────────────────────
function slugify(str) {
  return str.toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function toJpegBase64(srcPath, maxPx = MAX_PX) {
  const ext = path.extname(srcPath).toLowerCase()
  let inputBuffer

  if (ext === '.heic' || ext === '.heif') {
    // Try heic-convert first
    try {
      const heicConvert = require('heic-convert')
      const heicBuf = fs.readFileSync(srcPath)
      inputBuffer = await heicConvert({ buffer: heicBuf, format: 'JPEG', quality: 0.92 })
    } catch {
      // Fall back to sharp
      inputBuffer = fs.readFileSync(srcPath)
    }
  } else {
    inputBuffer = fs.readFileSync(srcPath)
  }

  const img = sharp(inputBuffer, { limitInputPixels: false })
  const meta = await img.metadata()
  const w = Math.min(meta.width || maxPx, maxPx)

  const jpegBuf = await sharp(inputBuffer, { limitInputPixels: false })
    .rotate()
    .resize({ width: w, withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer()

  return jpegBuf.toString('base64')
}

async function toPngBase64(srcPath) {
  const buf = fs.readFileSync(srcPath)
  const pngBuf = await sharp(buf, { limitInputPixels: false })
    .rotate()
    .resize({ width: Math.min(800, MAX_PX), withoutEnlargement: true })
    .png({ compressionLevel: 8 })
    .toBuffer()
  return pngBuf.toString('base64')
}

// ── Title parsing ─────────────────────────────────────────────────────────────
function parsePhotoTitle(filename) {
  let s = filename.replace(/\.(jpe?g|png|tiff?|heic|heif)$/i, '')
  s = s.replace(/_/g, "'") // restore apostrophes for nature (e.g., Blue Morpho_s → Blue Morpho's)
  s = s.replace(/\s+\d{8}[\s\d_]+$/g, '') // remove date codes
  s = s.replace(/[_]/g, ' ')
  return s.replace(/\s+/g, ' ').trim()
}

function parseEncausticTitle(filename) {
  let s = filename.replace(/\.(jpe?g|png|tiff?|heic|heif)$/i, '')
  const available = /available/i.test(s)
  s = s.replace(/\s*[-–]\s*available/gi, '').replace(/available/gi, '')
  s = s.replace(/\s+IMG_[\d_]+/gi, '')
  s = s.replace(/\s+DSC\d+/gi, '')
  s = s.replace(/\s+\d{4}-\d{2}-\d{2}\s+\d{2}\.\d{2}\.\d{2}/, '')
  s = s.replace(/[\s_]?(20\d{6}[_]\d{6})([_]\w+)*\s*$/i, '')

  let originalSize = null
  const m = s.match(/(\d+)[_.]?\s*[xX×]\s*(\d+)[_.]?/)
  if (m) originalSize = `${m[1]}" × ${m[2]}"`
  else {
    const m2 = s.match(/(\d+)[_]\s+(\d+)[_]/)
    if (m2) originalSize = `${m2[1]}" × ${m2[2]}"`
  }

  s = s.replace(/\d+[_.]?\s*[xX×]\s*\d+[_.]?/g, '')
  s = s.replace(/\d+[_]\s+\d+[_]/g, '')
  s = s.replace(/\b(\d+)[_]/g, '$1 ')
  s = s.replace(/\bEncaus?tic\s+on\s+Flat\s+Panel\b/gi, '')
  s = s.replace(/\bEncaus?tic\s+Cradled\s+Panel\b/gi, '')
  s = s.replace(/\bEncaus?tic\s+Flat\s+Panel\b/gi, '')
  s = s.replace(/\bEncaus?tic\s+on\s+Paper\b/gi, '')
  s = s.replace(/\bEncaus?tic\s+Cradled\b/gi, '')
  s = s.replace(/\bCradled\s+Panel\b/gi, '')
  s = s.replace(/\bFlat\s+Panel\b/gi, '')
  s = s.replace(/\bEncaus?tic\b/gi, '')
  s = s.replace(/\bCradled\b/gi, '')
  s = s.replace(/\bPanel\b/gi, '')
  s = s.replace(/_/g, ' ')
  s = s.replace(/\s+/g, ' ').trim().replace(/^[\s-]+|[\s-]+$/g, '').trim()

  return { title: s, available, originalSize }
}

function parseWatercolorTitle(filename) {
  let s = filename.replace(/\.(jpe?g|png|tiff?|heic|heif)$/i, '')
  let originalSize = null
  const m = s.match(/(\d+(?:\.\d+)?)[_.]?\s*[xX×]\s*(\d+(?:\.\d+)?)[_.]?/)
  if (m) originalSize = `${m[1]}" × ${m[2]}"`
  s = s.replace(/(\d+(?:\.\d+)?)[_.]?\s*[xX×]\s*(\d+(?:\.\d+)?)[_.]?/g, '')
  s = s.replace(/[_.]/g, ' ').replace(/\s+/g, ' ').trim()
  s = s.replace(/^[\s-]+|[\s-]+$/g, '').trim()
  return { title: s, originalSize }
}

function parseOilTitle(filename) {
  let s = filename.replace(/\.(jpe?g|png|tiff?|heic|heif)$/i, '')
  const available = /available/i.test(s)
  const isPleinAir = /plein\s*air/i.test(s)
  const isReprint = /archival\s*reprint/i.test(s) || /reprint/i.test(s)
  const inProgress = /in\s*progress/i.test(s)
  s = s.replace(/\s*IMG_[\d_]+/gi, '')
  s = s.replace(/plein\s*air[,]?/gi, '')
  s = s.replace(/available\s*(original\s*)?oil/gi, '')
  s = s.replace(/original\s*oil/gi, '')
  s = s.replace(/archival\s*reprints?\s*available/gi, '')
  s = s.replace(/archival\s*reprints?/gi, '')
  s = s.replace(/in\s*progress/gi, '')
  let originalSize = null
  const m = s.match(/(\d+)[_.]?\s*[xX×]\s*(\d+)[_.]?/)
  if (m) originalSize = `${m[1]}" × ${m[2]}"`
  s = s.replace(/(\d+)[_.]?\s*[xX×]\s*(\d+)[_.]?/g, '')
  s = s.replace(/[,_.]/g, ' ').replace(/\s+/g, ' ').trim().replace(/^[\s-]+|[\s-]+$/g, '').trim()
  return { title: s, available, originalSize, isPleinAir, isReprint, inProgress }
}

// ── Check existing data ───────────────────────────────────────────────────────
async function getExistingData() {
  console.log('Fetching existing data from site...')
  const res = await request('GET', '/api/admin/products')
  if (res.status !== 200) throw new Error(`Failed to fetch products: ${res.status}`)
  return res.body
}

// ── Upload helpers ────────────────────────────────────────────────────────────
async function uploadImage(type, base64, filename, category) {
  const res = await request('POST', '/api/admin/upload', { type, base64, filename, category })
  if (res.status !== 200) throw new Error(`Upload failed: ${JSON.stringify(res.body)}`)
  return res.body.filename
}

async function createFineArtRecord(artType, data) {
  const res = await request('PUT', '/api/admin/products', {
    type: 'fineArt', action: 'add', category: artType, data,
  })
  if (res.status !== 200) throw new Error(`Create fineArt failed: ${JSON.stringify(res.body)}`)
}

async function createPhotoRecord(category, data) {
  const res = await request('PUT', '/api/admin/products', {
    type: 'photo', action: 'add', category, data,
  })
  if (res.status !== 200) throw new Error(`Create photo failed: ${JSON.stringify(res.body)}`)
}

async function ensurePhotoCategory(slug, label, existing) {
  if (existing[slug]) return
  console.log(`  Creating category: ${slug} (${label})`)
  const res = await request('PUT', '/api/admin/products', {
    type: 'photoCategory', action: 'add', data: { slug, label, description: '' },
  })
  if (res.status !== 200) console.warn(`  Warning: failed to create category ${slug}`)
  existing[slug] = true
}

async function createStickerRecord(filename) {
  // stickers are auto-created by upload endpoint, but just in case
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🚀 Batch upload to ${SITE_URL}\n`)

  let existingData
  try {
    existingData = await getExistingData()
  } catch (e) {
    console.error('Could not fetch existing data:', e.message)
    process.exit(1)
  }

  // Build sets of existing filenames/ids to avoid duplicates
  const existingPhotos = new Set()
  const existingFineArt = new Set()
  const existingStickers = new Set()
  const existingCategories = {}

  if (existingData.photos) {
    for (const [cat, photos] of Object.entries(existingData.photos.photos || {})) {
      for (const p of photos) existingPhotos.add(p.filename)
      if (existingData.photos.categories?.[cat]) existingCategories[cat] = true
    }
  }
  if (existingData.fineArt?.works) {
    for (const works of Object.values(existingData.fineArt.works)) {
      for (const w of works) existingFineArt.add(w.filename)
    }
  }
  if (Array.isArray(existingData.stickers)) {
    for (const s of existingData.stickers) existingStickers.add(s)
  }

  let uploaded = 0
  let skipped = 0
  let errors = 0

  // Helper to process one file
  async function processFile({ srcFile, type, filename, category, createRecord }) {
    try {
      const isJpeg = /\.(jpe?g|heic|heif|tiff?)$/i.test(srcFile)
      const isPng = /\.png$/i.test(srcFile)

      let base64, finalFilename
      if (isPng) {
        base64 = await toPngBase64(srcFile)
        finalFilename = filename.replace(/\.[^.]+$/, '.png')
      } else {
        base64 = await toJpegBase64(srcFile)
        finalFilename = filename.replace(/\.[^.]+$/, '.jpg')
      }

      process.stdout.write(`  Uploading ${path.basename(srcFile)}... `)
      const savedFilename = await uploadImage(type, base64, finalFilename, category)
      process.stdout.write('✓\n')

      if (createRecord) await createRecord(savedFilename)

      uploaded++
    } catch (e) {
      process.stdout.write(`✗ ${e.message}\n`)
      errors++
    }
  }

  // ── NATURE PHOTOS ──────────────────────────────────────────────────────────
  console.log('\n📷 Nature Photos')
  await ensurePhotoCategory('nature', 'Nature', existingCategories)
  const natureFiles = fs.readdirSync(SOURCES.nature).filter(f => /\.(jpe?g|png|tiff?|heic|heif)$/i.test(f)).sort()
  for (const file of natureFiles) {
    const title = parsePhotoTitle(file)
    const slug = slugify(title)
    const filename = slug + (file.toLowerCase().endsWith('.png') ? '.png' : '.jpg')
    if (existingPhotos.has(filename)) { skipped++; console.log(`  Skip: ${filename}`); continue }
    await processFile({
      srcFile: path.join(SOURCES.nature, file),
      type: 'photo',
      filename,
      category: 'nature',
      createRecord: async (fn) => {
        await createPhotoRecord('nature', { id: slug, filename: fn, title, description: '', sortOrder: 0 })
      },
    })
  }

  // ── SAN FRANCISCO BAY PHOTOS ───────────────────────────────────────────────
  console.log('\n🌉 San Francisco Bay Photos')
  await ensurePhotoCategory('san-francisco-bay', 'San Francisco Bay', existingCategories)
  const sfFiles = fs.readdirSync(SOURCES.sfbay).filter(f => /\.(jpe?g|png|tiff?|heic|heif)$/i.test(f)).sort()
  for (const file of sfFiles) {
    const title = parsePhotoTitle(file)
    const slug = slugify(title)
    const filename = slug + '.jpg'
    if (existingPhotos.has(filename)) { skipped++; console.log(`  Skip: ${filename}`); continue }
    await processFile({
      srcFile: path.join(SOURCES.sfbay, file),
      type: 'photo',
      filename,
      category: 'san-francisco-bay',
      createRecord: async (fn) => {
        await createPhotoRecord('san-francisco-bay', { id: slug, filename: fn, title, description: '', sortOrder: 0 })
      },
    })
  }

  // ── WATERCOLORS ────────────────────────────────────────────────────────────
  console.log('\n🎨 Watercolors')
  const wcFiles = fs.readdirSync(SOURCES.watercolors).filter(f => /\.(jpe?g|png|tiff?|heic|heif)$/i.test(f)).sort()
  for (const file of wcFiles) {
    const { title, originalSize } = parseWatercolorTitle(file)
    const slug = slugify(title)
    const filename = slug + '.jpg'
    if (existingFineArt.has(filename)) { skipped++; console.log(`  Skip: ${filename}`); continue }
    await processFile({
      srcFile: path.join(SOURCES.watercolors, file),
      type: 'watercolor',
      filename,
      category: undefined,
      createRecord: async (fn) => {
        await createFineArtRecord('watercolors', { id: slug, filename: fn, title, description: '', originalSize, available: false, price: null })
      },
    })
  }

  // ── ENCAUSTICS ─────────────────────────────────────────────────────────────
  console.log('\n🕯️  Encaustics')
  const encFiles = fs.readdirSync(SOURCES.encaustics).filter(f => /\.(jpe?g|png|tiff?|heic|heif)$/i.test(f)).sort()
  for (const file of encFiles) {
    const { title, available, originalSize } = parseEncausticTitle(file)
    const slug = slugify(title)
    const filename = slug + (file.toLowerCase().endsWith('.png') ? '.png' : '.jpg')
    if (existingFineArt.has(filename)) { skipped++; console.log(`  Skip: ${filename}`); continue }
    await processFile({
      srcFile: path.join(SOURCES.encaustics, file),
      type: 'encaustic',
      filename,
      category: undefined,
      createRecord: async (fn) => {
        await createFineArtRecord('encaustics', { id: slug, filename: fn, title, description: '', originalSize, available, price: null })
      },
    })
  }

  // ── OIL PAINTINGS ─────────────────────────────────────────────────────────
  console.log('\n🖌️  Oil Paintings')
  const oilFiles = fs.readdirSync(SOURCES.oils)
    .filter(f => /\.(jpe?g|png|tiff?|heic|heif)$/i.test(f))
    .filter(f => !/archival|plein.air.in.progress/i.test(f)) // skip process images
    .sort()
  for (const file of oilFiles) {
    const { title, available, originalSize, isPleinAir } = parseOilTitle(file)
    const slug = slugify(title + (isPleinAir ? '-plein-air' : ''))
    const filename = slug + '.jpg'
    if (existingFineArt.has(filename)) { skipped++; console.log(`  Skip: ${filename}`); continue }
    await processFile({
      srcFile: path.join(SOURCES.oils, file),
      type: isPleinAir ? 'oil-pleinair' : 'oil',
      filename,
      category: undefined,
      createRecord: async (fn) => {
        await createFineArtRecord('oils', { id: slug, filename: fn, title, description: '', originalSize, available, price: null })
      },
    })
  }

  // ── STICKERS ───────────────────────────────────────────────────────────────
  console.log('\n🏷️  Stickers')
  const stickerFiles = fs.readdirSync(SOURCES.stickers).filter(f => /\.(png|jpe?g)$/i.test(f) && !f.includes('Background')).sort()
  for (const file of stickerFiles) {
    const slug = slugify(file.replace(/\.[^.]+$/, ''))
    const filename = slug + '.png'
    if (existingStickers.has(filename)) { skipped++; console.log(`  Skip: ${filename}`); continue }
    await processFile({
      srcFile: path.join(SOURCES.stickers, file),
      type: 'sticker',
      filename,
      category: undefined,
      createRecord: null, // auto-created by upload endpoint
    })
  }

  console.log(`\n✅ Done! Uploaded: ${uploaded}, Skipped: ${skipped}, Errors: ${errors}`)
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
