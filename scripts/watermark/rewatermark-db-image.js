/**
 * Re-watermark an image that has no local source file by fetching it
 * directly from the site's image API and re-uploading with a fresh watermark.
 *
 * Usage:
 *   cd photography
 *   railway run --service=imad_websites node ../scripts/watermark/rewatermark-db-image.js
 */

const crypto = require('crypto')
const https = require('https')
const http = require('http')

const SITE_URL = (process.env.SITE_URL || 'https://imadobegi.up.railway.app').replace(/\/$/, '')
const ADMIN_SECRET = process.env.ADMIN_SECRET
const ADMIN_COOKIE_ENV = process.env.ADMIN_COOKIE

// Images to pull from DB and re-upload (source file is unavailable locally)
const TARGETS = [
  { imgPath: 'fine-art/oils/the-two-fridas.jpg',                            type: 'oil',        category: '',    dbFilename: 'the-two-fridas.jpg' },
  { imgPath: 'fine-art/watercolors/bonneville-dam.jpg',                     type: 'watercolor', category: '',    dbFilename: 'bonneville-dam.jpg' },
  { imgPath: 'fine-art/watercolors/skamania-lodge-lobby-stevenson-wa.jpg',  type: 'watercolor', category: '',    dbFilename: 'skamania-lodge-lobby-stevenson-wa.jpg' },
]

let COOKIE
if (ADMIN_COOKIE_ENV) {
  COOKIE = ADMIN_COOKIE_ENV.startsWith('obg_admin=') ? ADMIN_COOKIE_ENV : `obg_admin=${ADMIN_COOKIE_ENV}`
} else if (ADMIN_SECRET) {
  const expires = Date.now() + 7 * 24 * 60 * 60 * 1000
  const payload = `admin:${expires}`
  const sig = crypto.createHmac('sha256', ADMIN_SECRET).update(payload).digest('hex')
  COOKIE = `obg_admin=${Buffer.from(`${payload}:${sig}`).toString('base64')}`
} else {
  console.error('Set ADMIN_SECRET or ADMIN_COOKIE env var.')
  process.exit(1)
}

function fetchBuffer(urlPath) {
  return new Promise((resolve, reject) => {
    const full = `${SITE_URL}${urlPath}`
    const url = new URL(full)
    const lib = url.protocol === 'https:' ? https : http
    const req = lib.request({
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'GET',
      headers: { Cookie: COOKIE },
      timeout: 60000,
    }, (res) => {
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => {
        if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode} for ${urlPath}`))
        resolve(Buffer.concat(chunks))
      })
    })
    req.on('error', reject)
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')) })
    req.end()
  })
}

function postJSON(urlPath, body) {
  return new Promise((resolve, reject) => {
    const full = `${SITE_URL}${urlPath}`
    const url = new URL(full)
    const lib = url.protocol === 'https:' ? https : http
    const bodyStr = JSON.stringify(body)
    const req = lib.request({
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: COOKIE, 'Content-Length': Buffer.byteLength(bodyStr) },
      timeout: 120000,
    }, (res) => {
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }) }
        catch { resolve({ status: res.statusCode, body: data }) }
      })
    })
    req.on('error', reject)
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')) })
    req.write(bodyStr)
    req.end()
  })
}

async function main() {
  let done = 0, errors = 0
  for (const t of TARGETS) {
    process.stdout.write(`  ${t.dbFilename} ... `)
    try {
      const buf = await fetchBuffer(`/api/img/${t.imgPath}`)
      const up = await postJSON('/api/admin/upload', {
        type: t.type,
        base64: buf.toString('base64'),
        filename: t.dbFilename,
        category: t.category,
      })
      if (up.status === 200) { process.stdout.write('✓\n'); done++ }
      else { process.stdout.write(`✗ (${up.status}) ${JSON.stringify(up.body)}\n`); errors++ }
    } catch (e) {
      process.stdout.write(`✗ ${e.message}\n`)
      errors++
    }
  }
  console.log(`\nDone: ✓ ${done}   ✗ ${errors}`)
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
