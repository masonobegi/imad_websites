const sharp = require('../../photography/node_modules/sharp')
const fs = require('fs')
const { ref, advance, d } = require('./path-data.json')

function buildWatermarkSvg(width, height) {
  const fontSize = Math.max(14, Math.round(Math.min(width, height) / 28))
  const scale = fontSize / ref
  const textWidth = advance * scale
  const gap = fontSize * 5
  const stepX = textWidth + fontSize * 6
  const extra = Math.max(width, height)
  const uses = []
  for (let y = -extra; y < height + extra; y += gap) {
    for (let x = -extra; x < width + extra; x += stepX) {
      uses.push(`<use xlink:href="#wm" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${scale.toFixed(4)})"/>`)
    }
  }
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    `<defs><path id="wm" d="${d}" fill="#FFFFFF" fill-opacity="0.45"/></defs>` +
    `<g transform="rotate(-35 ${width / 2} ${height / 2})">${uses.join('')}</g>` +
    `</svg>`
  )
}

async function main() {
  // Use a clean source image (no existing watermark) to prove text renders
  const srcPath = 'c:/Users/mason/Downloads/San Francisco Bay-20260617T183544Z-3-001/San Francisco Bay/Bay of Gold.jpg'
  const img = sharp(fs.existsSync(srcPath) ? srcPath : process.argv[2])
  const meta = await img.metadata()
  const w = meta.width, h = meta.height
  console.log('image', w, 'x', h)
  const wm = buildWatermarkSvg(w, h)
  console.log('svg bytes', wm.length)
  const out = 'C:/Users/mason/AppData/Local/Temp/claude/c--Users-mason-OneDrive-Desktop-Imad-website/2edb77c4-1c97-4248-9210-23b03392edf0/scratchpad/test-watermark.jpg'
  await img.composite([{ input: wm }]).jpeg({ quality: 90 }).toFile(out)
  console.log('wrote', out)
}
main().catch(e => { console.error(e); process.exit(1) })
