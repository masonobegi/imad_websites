const sharp = require('sharp')
const heicConvert = require('heic-convert')
const fs = require('fs')
const path = require('path')

sharp.cache(false)
sharp.concurrency(1)

const OIL_SRC = 'c:/Users/mason/Downloads/Oil Paintings-20260621T000103Z-3-001/Oil Paintings'
const PLEIN_SRC = 'c:/Users/mason/Downloads/Plein Air and reprints-20260621T000110Z-3-001/Plein Air and reprints'
const OIL_OUT = 'c:/Users/mason/OneDrive/Desktop/Imad_website/photography/public/fine-art/oils'
const PLEIN_OUT = 'c:/Users/mason/OneDrive/Desktop/Imad_website/photography/public/fine-art/oils/plein-air'
const MAX = 1920
const QUALITY = 88

function buildWatermarkSvg(width, height) {
  const cx = Math.round(width / 2), cy = Math.round(height / 2)
  const diag = Math.ceil(Math.sqrt(width * width + height * height))
  const texts = []
  for (let y = -diag; y <= diag; y += 185) {
    for (let x = -diag; x <= diag; x += 320) {
      texts.push(
        `<text x="${cx+x}" y="${cy+y}" font-family="Georgia, Times New Roman, serif" ` +
        `font-size="22" font-style="italic" fill="rgba(255,255,255,0.30)" letter-spacing="3">OBGillustrator.com</text>`
      )
    }
  }
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
    `<g transform="rotate(35 ${cx} ${cy})">` + texts.join('') + `</g></svg>`
  )
}

async function processImg(srcPath, outPath) {
  const ext = path.extname(srcPath).toLowerCase()
  let input = srcPath
  if (ext === '.heic' || ext === '.heif') {
    const buf = fs.readFileSync(srcPath)
    input = Buffer.from(await heicConvert({ buffer: buf, format: 'JPEG', quality: 1 }))
  }
  const meta = await sharp(input, { limitInputPixels: false }).rotate().metadata()
  const w = Math.min(meta.width || MAX, MAX)
  const h = Math.round((meta.height / meta.width) * w)
  const wm = buildWatermarkSvg(w, h)
  await sharp(input, { limitInputPixels: false })
    .rotate()
    .resize({ width: w, withoutEnlargement: true })
    .composite([{ input: wm, blend: 'over' }])
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toFile(outPath)
}

const OIL_FILES = [
  { src: 'Rhythms of Leimert Park 18_ x 24_ Not for Sale .jpg', slug: 'rhythms-of-leimert-park' },
  { src: 'South Falls Plein Air, Silverton, Oregon 16_ x 20_ Available Original Oil IMG_9435.HEIC', slug: 'south-falls' },
  { src: 'Wisteria_Final_2.tif', slug: 'wisteria' },
  { src: 'Wooden Shoe Tulip Festival Plein Air 16_ x 20_ Available Original Oil IMG_9428.HEIC', slug: 'wooden-shoe-tulip-festival' },
]

const PLEIN_FILES = [
  { src: 'South Falls Plein Air in progress IMG_9329.HEIC', slug: 'south-falls-plein-air' },
  { src: 'South Falls Archival Reprints Available 11_ x 14_ IMG_9585.HEIC', slug: 'south-falls-reprint' },
  { src: 'Tulip Festival Plein Air in Progress IMG_2266.JPG', slug: 'tulip-festival-plein-air' },
  { src: 'Tulip Festival Archival Reprints Available 11_ x 14 IMG_9584.HEIC', slug: 'tulip-festival-reprint' },
]

async function main() {
  fs.mkdirSync(OIL_OUT, { recursive: true })
  fs.mkdirSync(PLEIN_OUT, { recursive: true })

  console.log('\n== Oil Paintings ==')
  for (const f of OIL_FILES) {
    const src = path.join(OIL_SRC, f.src)
    const out = path.join(OIL_OUT, f.slug + '.jpg')
    console.log(`→ ${f.src}`)
    try {
      await processImg(src, out)
      console.log(`  ✓ ${f.slug}.jpg`)
    } catch (err) {
      console.error(`  ✗ ${err.message}`)
    }
  }

  console.log('\n== Plein Air / Reprints ==')
  for (const f of PLEIN_FILES) {
    const src = path.join(PLEIN_SRC, f.src)
    const out = path.join(PLEIN_OUT, f.slug + '.jpg')
    console.log(`→ ${f.src}`)
    try {
      await processImg(src, out)
      console.log(`  ✓ ${f.slug}.jpg`)
    } catch (err) {
      console.error(`  ✗ ${err.message}`)
    }
  }

  console.log('\n✅ Done')
}

main().catch(console.error)
