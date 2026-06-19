const sharp = require('./watermark/node_modules/sharp')
const fs = require('fs')
const path = require('path')

const SRC = 'c:/Users/mason/Downloads/Watercolors for OBGIllustrator.com-20260619T024200Z-3-001/Watercolors for OBGIllustrator.com'
const DEST = 'c:/Users/mason/OneDrive/Desktop/Imad_website/photography/public/fine-art/watercolors'

fs.mkdirSync(DEST, { recursive: true })

// Strip size info like "9_ x 12_", "5.5 X 7.5", "11 x 14" etc. from filename
function toSlug(filename) {
  const noExt = filename.replace(/\.(jpg|jpeg|heic)$/i, '')
  const noSize = noExt
    .replace(/\s+\d+[\d.]*\s*[_'"]?\s*[xX]\s*\d+[\d.]*\s*[_'".]?/g, '')
    .trim()
  return noSize
    .replace(/[_,]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/gi, '')
    .replace(/-+/g, '-')
    .toLowerCase()
    .replace(/^-|-$/g, '')
}

const files = fs.readdirSync(SRC).filter(f => /\.(jpg|jpeg|heic)$/i.test(f))

;(async () => {
  for (const file of files) {
    const slug = toSlug(file) + '.jpg'
    const dest = path.join(DEST, slug)
    console.log(`${file} → ${slug}`)
    await sharp(path.join(SRC, file))
      .jpeg({ quality: 92 })
      .toFile(dest)
  }
  console.log('\nDone:', files.length, 'images')
})()
