const sharp = require('sharp')
const heicConvert = require('heic-convert')
const fs = require('fs')
const path = require('path')

sharp.cache(false)
sharp.concurrency(1)

const SRC = 'c:/Users/mason/Downloads/Watercolors for OBGIllustrator.com-20260620T190432Z-3-001/Watercolors for OBGIllustrator.com'
const OUT = 'c:/Users/mason/OneDrive/Desktop/Imad_website/photography/public/fine-art/watercolors'
const MAX = 1920
const QUALITY = 88

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function buildWatermarkSvg(width, height) {
  const cx = Math.round(width / 2)
  const cy = Math.round(height / 2)
  const diag = Math.ceil(Math.sqrt(width * width + height * height))
  const stepX = 320
  const stepY = 185
  const texts = []
  for (let y = -diag; y <= diag; y += stepY) {
    for (let x = -diag; x <= diag; x += stepX) {
      texts.push(
        `<text x="${cx + x}" y="${cy + y}" ` +
        `font-family="Georgia, Times New Roman, serif" font-size="22" ` +
        `font-style="italic" fill="rgba(255,255,255,0.30)" letter-spacing="3">OBGillustrator.com</text>`
      )
    }
  }
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
    `<g transform="rotate(35 ${cx} ${cy})">` +
    texts.join('') +
    `</g></svg>`
  )
}

function parseFilename(filename) {
  const ext = path.extname(filename)
  let s = path.basename(filename, ext)
  // Strip size info: "9_ x 12_", "5.5 X 7.5", "11 x 14", "9 x 12", etc.
  s = s.replace(/\s+\d+[\._]?\d*\s*[xX×]\s*\d+[\._]?\d*/g, '')
  s = s.replace(/_+$/g, '').trim()
  return slugify(s)
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const files = fs.readdirSync(SRC).filter(f => /\.(jpe?g|png|heic|heif)$/i.test(f)).sort()

  for (const file of files) {
    const slug = parseFilename(file)
    const outName = slug + '.jpg'
    const outPath = path.join(OUT, outName)
    const srcPath = path.join(SRC, file)

    console.log(`→ ${file}  →  ${outName}`)

    try {
      const ext = path.extname(file).toLowerCase()
      let sharpInput = srcPath
      if (ext === '.heic' || ext === '.heif') {
        const heicBuf = fs.readFileSync(srcPath)
        sharpInput = Buffer.from(await heicConvert({ buffer: heicBuf, format: 'JPEG', quality: 1 }))
      }

      const meta = await sharp(sharpInput, { limitInputPixels: false }).rotate().metadata()
      const w = Math.min(meta.width, MAX)
      const h = Math.round((meta.height / meta.width) * w)
      const watermark = buildWatermarkSvg(w, h)

      await sharp(sharpInput, { limitInputPixels: false })
        .rotate()
        .resize({ width: w, withoutEnlargement: true })
        .composite([{ input: watermark, blend: 'over' }])
        .jpeg({ quality: QUALITY, mozjpeg: true })
        .toFile(outPath)

      console.log(`  ✓ ${outName}`)
    } catch (err) {
      console.error(`  ✗ ${err.message}`)
    }
  }
}

main().catch(console.error)
