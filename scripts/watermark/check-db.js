const https = require('https'), crypto = require('crypto')
const secret = process.env.ADMIN_SECRET
const expires = Date.now() + 86400000
const payload = 'admin:' + expires
const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex')
const cookie = 'obg_admin=' + Buffer.from(payload + ':' + sig).toString('base64')
https.get({ hostname: 'imadobegi.up.railway.app', path: '/api/admin/products', headers: { Cookie: cookie } }, res => {
  let d = ''
  res.on('data', c => d += c)
  res.on('end', () => {
    const j = JSON.parse(d)
    console.log('CATEGORIES:', Object.keys(j.photos.photos))
    Object.entries(j.photos.photos).forEach(([cat, photos]) => {
      console.log(cat + ':', photos.map(p => p.filename))
    })
    console.log('\nWATERCOLORS:', j.fineArt.works.watercolors.map(w => w.filename))
    console.log('\nOILS:', j.fineArt.works.oils.map(w => w.filename))
  })
})
