/**
 * Re-upload ALL photos to restore missing UploadedImage records.
 * Safe to run anytime — uses upsert, won't duplicate anything.
 *
 * Usage:
 *   cd photography
 *   railway run --service=imad_websites node ../scripts/watermark/reupload-all-photos.js
 */

const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const https = require('https')
const http = require('http')
const sharp = require('sharp')

sharp.cache(false)
sharp.concurrency(1)

const SITE_URL = (process.env.SITE_URL || 'https://imadobegi.up.railway.app').replace(/\/$/, '')
const ADMIN_SECRET = process.env.ADMIN_SECRET
const ADMIN_COOKIE_ENV = process.env.ADMIN_COOKIE
const MAX_PX = 2400
const JPEG_QUALITY = 88

const DOWNLOADS = 'c:/Users/mason/Downloads'
const SOURCES = {
  nature: `${DOWNLOADS}/Photography _Nature_HR-20260617T183541Z-3-001/Photography _Nature_HR`,
  'san-francisco-bay': `${DOWNLOADS}/San Francisco Bay-20260617T183544Z-3-001/San Francisco Bay`,
}

let COOKIE
if (ADMIN_COOKIE_ENV) {
  COOKIE = ADMIN_COOKIE_ENV.startsWith('obg_admin=') ? ADMIN_COOKIE_ENV : `obg_admin=${ADMIN_COOKIE_ENV}`
} else if (ADMIN_SECRET) {
  const expires = Date.now() + 7 * 24 * 60 * 60 * 1000
  const payload = `admin:${expires}`
  const sig = crypto.createHmac('sha256', ADMIN_SECRET).update(payload).digest('hex')
  COOKIE = `obg_admin=${Buffer.from(`${payload}:${sig}`).toString('base64')}`
} else {
  console.error('Error: Set ADMIN_SECRET or ADMIN_COOKIE env var.')
  process.exit(1)
}

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
      headers: { 'Content-Type': 'application/json', Cookie: COOKIE },
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

function slugify(str) {
  return str.toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function parseTitle(filename) {
  let s = filename.replace(/\.(jpe?g|png|tiff?|heic|heif)$/i, '')
  s = s.replace(/_/g, "'")
  s = s.replace(/\s+\d{8}[\s\d_]+$/g, '')
  s = s.replace(/[_]/g, ' ')
  return s.replace(/\s+/g, ' ').trim()
}

// Build map: slugified-filename -> source file path, for all source dirs
function buildSourceMap() {
  const map = {}
  for (const [cat, dir] of Object.entries(SOURCES)) {
    if (!fs.existsSync(dir)) { console.warn(`Source dir missing: ${dir}`); continue }
    const files = fs.readdirSync(dir).filter(f => /\.(jpe?g|png|tiff?|heic|heif)$/i.test(f))
    for (const file of files) {
      const title = parseTitle(file)
      const slug = slugify(title)
      const ext = file.toLowerCase().endsWith('.png') ? '.png' : '.jpg'
      const dbFilename = slug + ext
      map[dbFilename] = { srcPath: path.join(dir, file), category: cat }
    }
  }
  return map
}

async function main() {
  console.log(`\nFetching photo list from ${SITE_URL}...`)
  const res = await request('GET', '/api/admin/products')
  if (res.status !== 200) { console.error('Failed to fetch products:', res.status); process.exit(1) }

  const photosByCategory = res.body.photos?.photos || {}
  const allPhotos = []
  for (const [cat, photos] of Object.entries(photosByCategory)) {
    for (const p of photos) allPhotos.push({ ...p, category: cat })
  }
  console.log(`Found ${allPhotos.length} photos in DB`)

  const sourceMap = buildSourceMap()
  console.log(`Found ${Object.keys(sourceMap).length} source files on disk\n`)

  let uploaded = 0, skipped = 0, errors = 0

  for (const photo of allPhotos) {
    const src = sourceMap[photo.filename]
    if (!src) {
      console.log(`  No source file for ${photo.filename} (${photo.category}) — skipping`)
      skipped++
      continue
    }

    process.stdout.write(`  ${photo.filename} ... `)
    try {
      const inputBuffer = fs.readFileSync(src.srcPath)
      const img = sharp(inputBuffer, { limitInputPixels: false })
      const meta = await img.metadata()
      const w = Math.min(meta.width || MAX_PX, MAX_PX)
      const ext = photo.filename.endsWith('.png') ? '.png' : '.jpg'

      let jpegBuf
      if (ext === '.png') {
        jpegBuf = await sharp(inputBuffer, { limitInputPixels: false }).rotate().png().toBuffer()
      } else {
        jpegBuf = await sharp(inputBuffer, { limitInputPixels: false })
          .rotate()
          .resize({ width: w, withoutEnlargement: true })
          .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
          .toBuffer()
      }

      const base64 = jpegBuf.toString('base64')
      const up = await request('POST', '/api/admin/upload', {
        type: 'photo',
        base64,
        filename: photo.filename,
        category: photo.category,
      })

      if (up.status === 200) {
        process.stdout.write('✓\n')
        uploaded++
      } else {
        process.stdout.write(`✗ (${up.status})\n`)
        errors++
      }
    } catch (e) {
      process.stdout.write(`✗ ${e.message}\n`)
      errors++
    }
  }

  console.log(`\nDone! Uploaded: ${uploaded}, Skipped: ${skipped}, Errors: ${errors}`)
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
