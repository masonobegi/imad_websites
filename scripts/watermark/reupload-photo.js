/**
 * Re-upload a single photo whose UploadedImage DB record is missing.
 * The Photo record must already exist; this only restores the image binary.
 *
 * Usage (from repo root, with Railway env vars):
 *   railway run --service=photography node scripts/watermark/reupload-photo.js
 *
 * Or with a browser cookie:
 *   ADMIN_COOKIE="<paste obg_admin cookie value>" SITE_URL=https://obgillustrator.com node scripts/watermark/reupload-photo.js
 */

const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const https = require('https')
const http = require('http')
const sharp = require('sharp')

sharp.cache(false)
sharp.concurrency(1)

const SITE_URL = (process.env.SITE_URL || 'https://obgillustrator.com').replace(/\/$/, '')
const ADMIN_SECRET = process.env.ADMIN_SECRET
const ADMIN_COOKIE_ENV = process.env.ADMIN_COOKIE
const MAX_PX = 2400
const JPEG_QUALITY = 88

// ── Photo to re-upload ────────────────────────────────────────────────────────
const SRC_FILE = 'c:/Users/mason/Downloads/Photography _Nature_HR-20260617T183541Z-3-001/Photography _Nature_HR/Bufflehead Ballet.jpg'
const UPLOAD_FILENAME = 'bufflehead-ballet.jpg'
const PHOTO_CATEGORY = 'nature'

// ── Auth ──────────────────────────────────────────────────────────────────────
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

// ── HTTP helper ───────────────────────────────────────────────────────────────
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

async function main() {
  console.log(`\nRe-uploading: ${path.basename(SRC_FILE)}`)
  console.log(`Target: photos/${PHOTO_CATEGORY}/${UPLOAD_FILENAME} on ${SITE_URL}\n`)

  if (!fs.existsSync(SRC_FILE)) {
    console.error(`Source file not found: ${SRC_FILE}`)
    process.exit(1)
  }

  // Process with sharp — resize + JPEG compress (same as batch-upload)
  const inputBuffer = fs.readFileSync(SRC_FILE)
  const img = sharp(inputBuffer, { limitInputPixels: false })
  const meta = await img.metadata()
  const w = Math.min(meta.width || MAX_PX, MAX_PX)

  process.stdout.write('Processing image... ')
  const jpegBuf = await sharp(inputBuffer, { limitInputPixels: false })
    .rotate()
    .resize({ width: w, withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer()
  console.log(`done (${(jpegBuf.length / 1024).toFixed(0)} KB)`)

  const base64 = jpegBuf.toString('base64')

  process.stdout.write('Uploading to server... ')
  const res = await request('POST', '/api/admin/upload', {
    type: 'photo',
    base64,
    filename: UPLOAD_FILENAME,
    category: PHOTO_CATEGORY,
  })

  if (res.status === 200) {
    console.log('✓')
    console.log(`\nDone! The image is now stored at photos/${PHOTO_CATEGORY}/${res.body.filename}`)
    console.log('Bufflehead Ballet should now display correctly on the site.')
  } else {
    console.log('✗')
    console.error(`Upload failed (${res.status}):`, res.body)
    process.exit(1)
  }
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
