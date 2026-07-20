/**
 * Targeted re-watermark for specific files that had name mismatches.
 * Each entry maps the actual source file path → the DB filename it belongs to.
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
const DL = 'c:/Users/mason/Downloads'

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

// ─── Image processing ─────────────────────────────────────────────────────────
async function readImageBuffer(srcPath) {
  let buf = fs.readFileSync(srcPath)
  const ext = path.extname(srcPath).toLowerCase()
  if (ext === '.heic' || ext === '.heif') {
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

// ─── Targets: explicit source → DB mapping ────────────────────────────────────
// These are the specific files that were skipped in the full run due to name mismatches.
const TARGETS = [
  // Photos (nature category)
  {
    src: `${DL}/Photography _Nature_HR-20260617T183541Z-3-001/Photography _Nature_HR/Blue Morpho_s Secret Eyes.jpg`,
    type: 'photo', category: 'nature', dbFilename: 'blue-morphos-secret-eyes.jpg',
    label: 'Blue Morphos Secret Eyes',
  },
  {
    src: `${DL}/Photography _Nature_HR-20260617T183541Z-3-001/Photography _Nature_HR/Backlit Sentinel_Cap Rock Under the Stars.tif`,
    type: 'photo', category: 'nature', dbFilename: 'backlit-sentinelcap-rock-under-the-stars.jpg',
    label: 'Backlit Sentinel Cap Rock',
  },
  // Photos (san-francisco category)
  {
    src: `${DL}/San Francisco Bay-20260617T183544Z-3-001/San Francisco Bay/DSC03766_101217 Fire_suns.tif`,
    type: 'photo', category: 'san-francisco', dbFilename: 'dsc03766101217-firesuns.jpg',
    label: 'Fire Sun',
  },
  // Encaustic — misspelled "Persistance" vs DB "persistence"
  {
    src: `${DL}/Encaustic Gallery for OBGillustrator.com-20260620T190510Z-3-001/Encaustic Gallery for OBGillustrator.com/Tree of Persistance 6_ x 8_ Encaustic on Flat Panel .jpg`,
    type: 'encaustic', category: '', dbFilename: 'tree-of-persistence.jpg',
    label: 'Tree of Persistence',
  },
]

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  let done = 0, errors = 0
  for (const t of TARGETS) {
    if (!fs.existsSync(t.src)) {
      console.log(`SKIP  ${t.label} — source file not found: ${t.src}`)
      continue
    }
    process.stdout.write(`  ${t.label} ... `)
    try {
      const up = await uploadFile(t.src, t.type, t.category, t.dbFilename)
      if (up.status === 200) { process.stdout.write('✓\n'); done++ }
      else { process.stdout.write(`✗ (${up.status}) ${JSON.stringify(up.body)}\n`); errors++ }
    } catch (e) {
      process.stdout.write(`✗ ${e.message}\n`)
      errors++
    }
  }

  console.log(`\nDone: ✓ ${done}   ✗ ${errors}`)

  if (errors === 0 && done > 0) {
    console.log('\nStill genuinely missing (Imad must re-upload manually):')
    console.log('  - two-fridas.jpg (oil) — file not in Downloads')
    console.log('  - bonneville-dam.jpg (watercolor) — file not in Downloads')
    console.log('  - skamania-lodge-lobby-stevenson-wa.jpg (watercolor) — file not in Downloads')
  }
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
