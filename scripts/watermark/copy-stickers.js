const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const SRC = 'c:/Users/mason/Downloads/Stickers-20260621T000106Z-3-001/Stickers'
const OUT = 'c:/Users/mason/OneDrive/Desktop/Imad_website/photography/public/stickers'

// Pick a curated set for the preview gallery
const PICKS = [
  'Sasquatch Looking at Stickers_Stickers Page Icon.png',
  'Kayaking Sasquatch Sticker.png',
  'Gaming Sasquatch.png',
  'Crater_lake_Sasquatch_no text.png',
  'Day of the Dead Sasquatch.png',
  'Sasquatch Artist.png',
  'Mountain Biking Sasquatch.png',
  'Owl_Sticker.png',
  'Martial Artists Sasquatch.png',
  'Sasquatch_Fishing.png',
  'Yoga Sitting Pose_Sasquatch.png',
  'Golfing Sasquatch.png',
]

function slugify(s) {
  return s.replace(/\.png$/i, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function buildWatermarkSvg(width, height) {
  const cx = Math.round(width / 2), cy = Math.round(height / 2)
  const diag = Math.ceil(Math.sqrt(width * width + height * height))
  const texts = []
  for (let y = -diag; y <= diag; y += 140) {
    for (let x = -diag; x <= diag; x += 240) {
      texts.push(
        `<text x="${cx+x}" y="${cy+y}" font-family="Georgia, Times New Roman, serif" ` +
        `font-size="16" font-style="italic" fill="rgba(255,255,255,0.45)" letter-spacing="2">OBGillustrator.com</text>`
      )
    }
  }
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
    `<g transform="rotate(35 ${cx} ${cy})">` + texts.join('') + `</g></svg>`
  )
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const results = []

  for (const file of PICKS) {
    const src = path.join(SRC, file)
    const slug = slugify(file)
    const outName = slug + '.png'
    const outPath = path.join(OUT, outName)
    console.log(`→ ${file}`)
    try {
      const img = sharp(src).resize({ width: 600, height: 600, fit: 'inside', withoutEnlargement: true })
      const meta = await img.clone().metadata()
      // Calculate actual output size (resize may be smaller than 600x600 due to fit:inside)
      const aspect = meta.width / meta.height
      let w, h
      if (aspect >= 1) { w = Math.min(meta.width, 600); h = Math.round(w / aspect) }
      else              { h = Math.min(meta.height, 600); w = Math.round(h * aspect) }
      const wm = buildWatermarkSvg(w, h)
      await img.composite([{ input: wm, blend: 'over' }]).png({ compressionLevel: 8 }).toFile(outPath)
      console.log(`  ✓ ${outName} (${w}×${h})`)
      results.push({ slug, filename: outName, title: file.replace(/\.png$/i, '').replace(/_/g, ' ') })
    } catch (err) {
      console.error(`  ✗ ${err.message}`)
    }
  }

  console.log('\nFilenames for stickers page:')
  console.log(results.map(r => `'${r.filename}'`).join(',\n'))
}

main().catch(console.error)
