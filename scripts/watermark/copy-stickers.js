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
      // Resize to max 600px, keep transparency
      await sharp(src).resize({ width: 600, height: 600, fit: 'inside', withoutEnlargement: true }).png({ compressionLevel: 8 }).toFile(outPath)
      console.log(`  ✓ ${outName}`)
      results.push({ slug, filename: outName, title: file.replace(/\.png$/i, '').replace(/_/g, ' ') })
    } catch (err) {
      console.error(`  ✗ ${err.message}`)
    }
  }

  console.log('\nFilenames for stickers page:')
  console.log(results.map(r => `'${r.filename}'`).join(',\n'))
}

main().catch(console.error)
