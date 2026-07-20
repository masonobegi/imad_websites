/**
 * Re-watermark ALL content on the site from original source files.
 * Safe to run anytime — uses upsert, never double-watermarks because
 * we always start from the original unwatermarked source file.
 *
 * Usage:
 *   cd photography
 *   railway run --service=imad_websites node ../scripts/watermark/rewatermark-all.js
 */

const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const https = require('https')
const http = require('http')
const sharp = require('sharp')
const heicConvert = require('./node_modules/heic-convert')

sharp.cache(false)
sharp.concurrency(1)

const SITE_URL = (process.env.SITE_URL || 'https://imadobegi.up.railway.app').replace(/\/$/, '')
const ADMIN_SECRET = process.env.ADMIN_SECRET
const ADMIN_COOKIE_ENV = process.env.ADMIN_COOKIE
const DOWNLOADS = 'c:/Users/mason/Downloads'

const SOURCE_DIRS = {
  'photo:nature':          `${DOWNLOADS}/Photography _Nature_HR-20260617T183541Z-3-001/Photography _Nature_HR`,
  'photo:san-francisco':   `${DOWNLOADS}/San Francisco Bay-20260617T183544Z-3-001/San Francisco Bay`,
  'watercolor':            `${DOWNLOADS}/Watercolors for OBGIllustrator.com-20260619T024200Z-3-001/Watercolors for OBGIllustrator.com`,
  'encaustic':             `${DOWNLOADS}/Encaustic Gallery for OBGillustrator.com-20260620T190510Z-3-001/Encaustic Gallery for OBGillustrator.com`,
  'oil':                   `${DOWNLOADS}/Oil Paintings-20260621T000103Z-3-001/Oil Paintings`,
  'sticker':               `${DOWNLOADS}/Stickers-20260621T000106Z-3-001/Stickers`,
}

// Explicit source overrides for files whose names don't match the DB slug.
// key = DB filename (no path), value = absolute path to source file.
const EXPLICIT_SOURCES = {
  'blue-morphos-secret-eyes.jpg':
    `${DOWNLOADS}/Photography _Nature_HR-20260617T183541Z-3-001/Photography _Nature_HR/Blue Morpho_s Secret Eyes.jpg`,
  'backlit-sentinelcap-rock-under-the-stars.jpg':
    `${DOWNLOADS}/Photography _Nature_HR-20260617T183541Z-3-001/Photography _Nature_HR/Backlit Sentinel_Cap Rock Under the Stars.tif`,
  'dsc03766101217-firesuns.jpg':
    `${DOWNLOADS}/San Francisco Bay-20260617T183544Z-3-001/San Francisco Bay/DSC03766_101217 Fire_suns.tif`,
  'tree-of-persistence.jpg':
    `${DOWNLOADS}/Encaustic Gallery for OBGillustrator.com-20260620T190510Z-3-001/Encaustic Gallery for OBGillustrator.com/Tree of Persistance 6_ x 8_ Encaustic on Flat Panel .jpg`,
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
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

// ─── HTTP helper ──────────────────────────────────────────────────────────────
function request(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const full = `${SITE_URL}${urlPath}`
    const url = new URL(full)
    const lib = url.protocol === 'https:' ? https : http
    const bodyStr = body ? JSON.stringify(body) : undefined
    const opts = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        Cookie: COOKIE,
        ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
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
    if (bodyStr) req.write(bodyStr)
    req.end()
  })
}

// ─── Filename helpers ─────────────────────────────────────────────────────────
// Must match sanitizeFilename() in upload.ts exactly
function sanitizeFilename(name) {
  const ext = path.extname(name).toLowerCase().replace(/[^.a-z0-9]/g, '')
  const base = path.basename(name, path.extname(name))
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return `${base || 'image'}${ext}`
}

function stripExt(filename) {
  return filename.replace(/\.[^.]+$/, '')
}

// Build list of { srcPath, sanitizedBase } for all files in a directory.
// sanitizedBase = sanitizeFilename(file) without extension.
function buildSourceList(dir) {
  if (!fs.existsSync(dir)) { console.warn(`  Source dir missing: ${dir}`); return [] }
  return fs.readdirSync(dir)
    .filter(f => /\.(jpe?g|png|webp|tiff?|heic|heif)$/i.test(f))
    .map(f => ({
      srcPath: path.join(dir, f),
      sanitizedBase: stripExt(sanitizeFilename(f)),
    }))
}

// Find the source file whose sanitized base STARTS WITH the DB filename base.
// This handles "atlantic-crossing" matching "atlantic-crossing-9-x-12-...jpg".
function findSource(dbFilename, sourceList) {
  // Explicit override wins — handles apostrophe/underscore name mismatches
  if (EXPLICIT_SOURCES[dbFilename] && fs.existsSync(EXPLICIT_SOURCES[dbFilename])) {
    return EXPLICIT_SOURCES[dbFilename]
  }
  const dbBase = stripExt(dbFilename)
  // Exact match first
  const exact = sourceList.find(s => s.sanitizedBase === dbBase)
  if (exact) return exact.srcPath
  // Prefix match: source file title starts with the DB slug
  const prefix = sourceList.find(s => s.sanitizedBase.startsWith(dbBase))
  if (prefix) return prefix.srcPath
  return null
}

// ─── Upload one file ──────────────────────────────────────────────────────────
async function readImageBuffer(srcPath) {
  let buf = fs.readFileSync(srcPath)
  const ext = path.extname(srcPath).toLowerCase()
  if (ext === '.heic' || ext === '.heif') {
    // heic-convert turns HEIC into a raw RGBA buffer we can hand to sharp
    const jpegBuf = await heicConvert({ buffer: buf, format: 'JPEG', quality: 0.95 })
    buf = Buffer.from(jpegBuf)
  }
  return buf
}

async function uploadFile(srcPath, uploadType, uploadCategory, dbFilename) {
  const inputBuf = await readImageBuffer(srcPath)
  const meta = await sharp(inputBuf, { limitInputPixels: false }).metadata()
  const w = Math.min(meta.width || 2400, 2400)

  let outBuf
  if (dbFilename.endsWith('.png')) {
    outBuf = await sharp(inputBuf, { limitInputPixels: false }).rotate().png().toBuffer()
  } else {
    outBuf = await sharp(inputBuf, { limitInputPixels: false })
      .rotate()
      .resize({ width: w, withoutEnlargement: true })
      .jpeg({ quality: 92, mozjpeg: true })
      .toBuffer()
  }

  return request('POST', '/api/admin/upload', {
    type: uploadType,
    base64: outBuf.toString('base64'),
    filename: dbFilename,
    category: uploadCategory || 'nature',
  })
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\nFetching content list from ${SITE_URL}...`)
  const res = await request('GET', '/api/admin/products')
  if (res.status !== 200) { console.error('Failed to fetch products:', res.status); process.exit(1) }

  const { fineArt, photos, stickers } = res.body
  let totalDone = 0, totalSkipped = 0, totalErrors = 0

  async function processItems(label, items, uploadType, sourceDir, categoryArg) {
    console.log(`\n── ${label} ──`)
    const sourceList = buildSourceList(sourceDir)
    console.log(`  ${items.length} in DB, ${sourceList.length} source files`)
    for (const item of items) {
      const filename = item.filename || item
      const srcPath = findSource(filename, sourceList)
      if (!srcPath) {
        // No CLEAN local source — SKIP. Never re-watermark from the DB copy:
        // the DB image is already watermarked, so re-watermarking it would
        // stack a second (third, fourth...) watermark on top. Compounding
        // watermarks is exactly the bug this avoids. These images must be
        // re-uploaded through admin from a clean original instead.
        console.log(`  SKIP ${filename} — no clean source (leave as-is, do NOT compound)`)
        totalSkipped++
        continue
      }
      process.stdout.write(`  ${filename} ... `)
      try {
        const up = await uploadFile(srcPath, uploadType, categoryArg || '', filename)
        if (up.status === 200) { process.stdout.write('✓\n'); totalDone++ }
        else { process.stdout.write(`✗ (${up.status}) ${JSON.stringify(up.body)}\n`); totalErrors++ }
      } catch (e) {
        process.stdout.write(`✗ ${e.message}\n`)
        totalErrors++
      }
    }
  }

  // Photos
  for (const [catKey, sourceDir] of Object.entries(SOURCE_DIRS).filter(([k]) => k.startsWith('photo:'))) {
    const category = catKey.replace('photo:', '')
    const catPhotos = photos?.photos?.[category] || []
    await processItems(`Photos / ${category}`, catPhotos, 'photo', sourceDir, category)
  }

  // Fine art
  await processItems('Watercolors', fineArt?.works?.watercolors || [], 'watercolor', SOURCE_DIRS['watercolor'])
  await processItems('Encaustics', fineArt?.works?.encaustics || [], 'encaustic', SOURCE_DIRS['encaustic'])
  await processItems('Oil Paintings', fineArt?.works?.oils || [], 'oil', SOURCE_DIRS['oil'])

  // Stickers (array of filenames, not objects)
  await processItems('Stickers', (stickers || []).map(f => ({ filename: f })), 'sticker', SOURCE_DIRS['sticker'])

  console.log(`\n${'═'.repeat(45)}`)
  console.log(`Done!  ✓ ${totalDone} uploaded   — ${totalSkipped} skipped (no source)   ✗ ${totalErrors} errors`)
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
