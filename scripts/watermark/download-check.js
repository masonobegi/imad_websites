const https = require('https'), crypto = require('crypto'), fs = require('fs')
const secret = process.env.ADMIN_SECRET
const expires = Date.now() + 86400000
const payload = 'admin:' + expires
const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex')
const cookie = 'obg_admin=' + Buffer.from(payload + ':' + sig).toString('base64')
const out = process.argv[3] || 'C:/Users/mason/AppData/Local/Temp/claude/c--Users-mason-OneDrive-Desktop-Imad-website/2edb77c4-1c97-4248-9210-23b03392edf0/scratchpad/current-firesun.jpg'
const imgPath = process.argv[2] || 'photos/san-francisco/dsc03766101217-firesuns.jpg'
https.get({ hostname: 'imadobegi.up.railway.app', path: '/api/img/' + imgPath, headers: { Cookie: cookie } }, res => {
  console.log('status', res.statusCode, 'type', res.headers['content-type'])
  const chunks = []
  res.on('data', c => chunks.push(c))
  res.on('end', () => {
    const buf = Buffer.concat(chunks)
    fs.writeFileSync(out, buf)
    console.log('saved', buf.length, 'bytes to', out)
  })
})
