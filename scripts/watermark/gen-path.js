const opentype = require('opentype.js')
const fs = require('fs')

// Try libre Open Sans (woff) first, fall back to system Arial for geometry.
const candidates = [
  'node_modules/@fontsource/open-sans/files/open-sans-latin-400-normal.woff',
  'node_modules/@fontsource/open-sans/files/open-sans-latin-700-normal.woff',
  'C:/Windows/Fonts/arial.ttf',
  'C:/Windows/Fonts/arialbd.ttf',
]

let font, used
for (const c of candidates) {
  try {
    if (!fs.existsSync(c)) continue
    const buf = fs.readFileSync(c)
    // opentype.parse needs an ArrayBuffer
    font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength))
    used = c
    break
  } catch (e) {
    console.error('  failed', c, e.message)
  }
}
if (!font) { console.error('No font could be loaded'); process.exit(1) }

const text = 'OBGillustrator.com'
const REF = 100 // reference font size in px
// Baseline at y=0, start at x=0
const p = font.getPath(text, 0, 0, REF)
const d = p.toPathData(3)

// Advance width so we know how wide one instance is
const advance = font.getAdvanceWidth(text, REF)

console.log('FONT_USED:', used)
console.log('REF:', REF)
console.log('ADVANCE:', advance.toFixed(3))
console.log('PATH_D_START')
console.log(d)
console.log('PATH_D_END')

// Also write to a JSON file we can consume programmatically
fs.writeFileSync('path-data.json', JSON.stringify({ ref: REF, advance, d }, null, 0))
console.log('wrote path-data.json')
