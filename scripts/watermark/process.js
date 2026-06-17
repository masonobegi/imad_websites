const sharp = require('sharp')
const exifr = require('exifr')
const fs = require('fs')
const path = require('path')

sharp.cache(false)
sharp.concurrency(1)

const SOURCES = {
  nature: 'c:/Users/mason/Downloads/Photography _Nature_HR-20260617T183541Z-3-001/Photography _Nature_HR',
  'san-francisco': 'c:/Users/mason/Downloads/San Francisco Bay-20260617T183544Z-3-001/San Francisco Bay',
}

const OUT_BASE = 'c:/Users/mason/OneDrive/Desktop/Imad_website/photography/public/photos'
const MAX_WIDTH = 1600
const QUALITY = 88

// Fallback descriptions keyed by cleaned title
const FALLBACK_DESCRIPTIONS = {
  'backlit sentinel cap rock under the stars': 'The famous Cap Rock formation at Joshua Tree National Park silhouetted against a brilliant Milky Way. Shot during a rare clear desert night with minimal light pollution, the stars form a river of light above the ancient granite.',
  'blue morpho s secret eyes': 'A stunning close-up revealing the intricate eyespot patterns on a Blue Morpho butterfly\'s wing undersides. Captured in natural light, these hidden eyes serve as the butterfly\'s first line of defense against predators.',
  'bufflehead ballet': 'Two Bufflehead ducks mid-courtship on glassy water, their iridescent plumage catching the morning light in perfect symmetry. These smallest of North American diving ducks are rarely this still.',
  'crimson patch longwing on lantana': 'A vivid Crimson Patch Longwing butterfly feeds on a cluster of Lantana blooms, its scarlet and black wings spread wide. Lantana\'s dense flower clusters make it a favorite nectar source for longwing butterflies throughout their range.',
  'dahlia symphony': 'A garden of dahlias in full late-summer bloom, their layered petals composing a symphony of color from deep crimson to pale gold. Dahlias are among the few flowers that grow more complex the longer they bloom.',
  'delicate arch at dawn': 'Utah\'s most iconic natural arch photographed in the first light of dawn, when the Entrada sandstone glows warm amber against a pale sky. The 52-foot arch took millions of years of erosion to carve.',
  'el truko': 'A weathered vintage truck stands as an accidental monument to the American West, its rust and sun-bleached surfaces telling decades of desert stories. Found near an abandoned homestead in the California high desert.',
  'ghost town coupe': 'A vintage automobile, frozen in time, rests in an abandoned ghost town. The passage of decades has turned it into unintentional sculpture — rust, dust, and desert light conspiring to make something beautiful.',
  'gondolas of venice': 'Classic Venetian gondolas bob gently on a quiet canal before the morning tourist crowds arrive, their ornate ferro prows reflected in still water. This is Venice as it has looked for centuries.',
  'jewels of pride of madeira': 'The vibrant jewel-toned flowers of the Pride of Madeira plant — each tiny bloom a gem in purple and violet — catch the morning light along the California coast where this Mediterranean plant has naturalized.',
  'ladybug on winter branch': 'A solitary ladybug makes her way along a bare winter branch, a small burst of crimson against a pale landscape. Ladybugs overwinter in clusters but occasionally emerge alone on warmer days.',
  'lotus serenity': 'A single lotus blossom rises from still water, its pink petals unfurling in perfect peace. The lotus has been a symbol of purity and enlightenment for thousands of years — its roots in mud, its flower in light.',
  'milky way over hidden valley': 'The core of our galaxy arches over Joshua Tree\'s Hidden Valley, a river of stars flowing between the iconic Jumbo Rocks formations. The Mojave Desert\'s low humidity and sparse population make it one of California\'s best stargazing destinations.',
  'milky way over joshua tree': 'A lone Joshua Tree — found only in the Mojave Desert — reaches upward toward the full sweep of the Milky Way in this long-exposure night photograph. These trees can live for hundreds of years.',
  'mists of tuscany': 'Rolling Tuscan hillsides wrapped in morning mist, with a lone cypress-lined road disappearing into soft golden haze. This landscape has been painted, photographed, and written about for centuries — and still surprises.',
  'oakland in a sea of clouds': 'Oakland\'s downtown skyline floats above a dense marine layer that fills the bay, creating the striking illusion of a city built on clouds. This view from the hills requires patience — the fog must be deep enough to cover the bay but thin enough to clear the buildings.',
  'paper kite in bloom': 'A Paper Kite butterfly — its wings like translucent stained glass in white and black — rests on a tropical flower in full bloom. Found throughout Southeast Asia, the Paper Kite is one of the largest and most graceful of the brush-footed butterflies.',
  'path beneath the annular sun': 'A remarkable annular solar eclipse captured at its peak, the ring of fire hovering above a winding desert trail. During an annular eclipse, the moon is too far from Earth to fully cover the sun, leaving a glowing ring.',
  'prairie giants': 'Towering wind turbines stand sentinel on the California prairie, their blades turning slowly against a wide, open sky. The same winds that once drove the great cattle drives now power tens of thousands of homes.',
  'royal display': 'A male bird of paradise in full courtship display, his plumage an explosion of iridescent color arranged to maximize impact. These birds spend years perfecting their displays before attracting a mate.',
  'sentinel of the still waters': 'A great blue heron stands motionless at the edge of a glassy pond, patient and perfectly still in the early morning quiet. Great blue herons can stand without moving for thirty minutes or more while waiting for fish to come within reach.',
  'spring fields of san luis obispo': 'Rolling hills of San Luis Obispo County carpeted in spring wildflowers after a wet winter, the landscape rippling with lupine, poppies, and mustard. The Central Coast\'s wildflower displays are among California\'s most spectacular.',
  'storm light over avila pier': 'Dramatic storm light breaks through the clouds above Avila Beach Pier, casting a golden spotlight on the Pacific and painting the century-old wooden pier in warm amber. These windows of light last only seconds.',
  'storm watch at walton lighthouse': 'The Mark Abbott Memorial Lighthouse — known locally as the Walton Lighthouse — stands firm as a winter storm churns the surf around it, waves breaking white against the concrete tower at the Santa Cruz harbor mouth.',
  'surrey bikes of pismo beach': 'Colorful surrey bikes line the Pismo Beach boardwalk on a bright afternoon, their fringed canopies catching the sea breeze. Pismo has offered these four-wheeled pedal carriages for decades — one of the California coast\'s enduring simple pleasures.',
  'sweat bee on russian sage': 'A tiny metallic sweat bee works the lavender-blue spires of Russian Sage, her compact body dusted with pollen. Sweat bees are among our most important pollinators and among our most beautiful — often overlooked because of their small size.',
  'the lone cypress': 'The famous Lone Cypress at Pebble Beach — perhaps California\'s most photographed tree — clings to its granite perch above Carmel Bay. Estimated to be over 250 years old, it has been a protected landmark since 1990.',
  'twilight at manhattan beach pier': 'The Manhattan Beach Pier extends into a twilight sky ablaze with color, the Pacific glowing purple and rose below. The pier, rebuilt after a 1913 storm, has been a gathering place on the South Bay for over a century.',
  'twisted survivor of the canyon': 'An ancient bristlecone pine — possibly thousands of years old — gnarled and sculpted by centuries of high-altitude wind and weather, persists where almost nothing else can. These trees survive precisely because they grow so slowly.',
  'white-lined sphinx among sweet williams': 'A White-Lined Sphinx moth hovers hummingbird-like above Sweet William flowers, its wings a sustained blur of motion. These moths are often mistaken for hummingbirds and, like them, can hover in place while feeding.',
  'zebra longwing on lantana': 'A bold Zebra Longwing butterfly — Florida\'s official state butterfly — rests on bright Lantana blossoms in dappled garden light. Unlike most butterflies, Zebra Longwings can digest pollen, giving them a lifespan of several months rather than weeks.',
  'bay of gold': 'San Francisco Bay catches the last golden light of late afternoon, the water transformed into hammered gold under a blazing sky. From this angle, the bay becomes less a body of water than a mirror for the sun.',
  'blue angels over the golden gate': 'The U.S. Navy\'s Blue Angels precision flight team roars over the Golden Gate Bridge during Fleet Week, the F/A-18 Hornets trailing vapor against an October sky. Fleet Week has drawn this kind of spectacle to the bay since 1981.',
  'bridging two eras': 'The Bay Bridge\'s new eastern span alongside its predecessor, a photograph about time, engineering, and the bay\'s constant presence beneath both. The old span was demolished after the new one opened in 2013.',
  'dsc03766 101217 fire suns': 'During the devastating 2017 North Bay fires, smoke turned the Bay Area sun blood-red for days — an eerie, apocalyptic light unlike anything most residents had ever seen. This image was made in the middle of the afternoon.',
  'fireworks over the bay': 'Fourth of July fireworks burst over San Francisco Bay in a long-exposure reflection of light and color, the display mirrored in the dark water below the Bay Bridge.',
  'gateway to the pacific': 'The Golden Gate Bridge photographed from the Marin Headlands, framing the bay and the city skyline beyond. Completed in 1937, it was for decades the longest suspension bridge in the world.',
  'golden burst over the bay': 'A spectacular sunburst erupts through a break in the storm clouds over San Francisco Bay, flooding the choppy water with light in a shaft that lasted only a few minutes.',
  'golden gate in the mist': 'The Golden Gate Bridge partly veiled in the famous San Francisco fog, the south tower visible while the north disappears into the marine layer. The bridge was specifically painted international orange to remain visible in this fog.',
  'harvest moon over the bay': 'A full harvest moon rises enormous and orange above the San Francisco Bay, its reflection stretching across the water between the Bay Bridge\'s lights. The harvest moon\'s low trajectory through the atmosphere makes it appear far larger than it is.',
  'moonrise between two bridges': 'The moon rises perfectly framed between the Bay Bridge and the Golden Gate in this carefully timed photograph. Predicting this alignment requires calculating the moon\'s exact position weeks in advance.',
  'the bay beneath the clouds': 'A wide view of the entire bay system from elevation above the marine layer, the bridges tracing silver lines across the blue water, the city a cluster of white on the peninsula tip.',
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function cleanTitle(filename) {
  return filename
    .replace(/\.(tif|tiff|jpg|jpeg|png)$/i, '')
    .replace(/_/g, ' — ')
    .replace(/^DSC\d+_\d+\s+/i, '')
}

function getDescription(title) {
  const key = title.toLowerCase()
    .replace(/_/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  for (const [k, v] of Object.entries(FALLBACK_DESCRIPTIONS)) {
    if (key.includes(k) || k.includes(key.split(' ').slice(0, 4).join(' '))) {
      return v
    }
  }
  return `A fine art photograph by Imad. Printed on archival paper with pigment inks for lasting color.`
}

async function getExifDescription(filepath) {
  try {
    const data = await exifr.parse(filepath, {
      xmp: true,
      iptc: true,
      translateValues: true,
    })
    if (!data) return null
    return data['Caption-Abstract'] || data.description || data.ImageDescription || data.UserComment || null
  } catch {
    return null
  }
}

function buildWatermarkSvg(width, height) {
  const fontSize = Math.max(28, Math.round(width * 0.022))
  const y = height - Math.round(height * 0.042)
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <defs>
        <filter id="dropshadow">
          <feDropShadow dx="0" dy="2" stdDeviation="6" flood-color="rgba(0,0,0,1)" flood-opacity="1"/>
        </filter>
      </defs>
      <text
        x="${Math.round(width / 2)}"
        y="${y}"
        text-anchor="middle"
        font-family="Georgia, Times New Roman, serif"
        font-size="${fontSize}px"
        font-style="italic"
        fill="rgba(255,255,255,0.80)"
        filter="url(#dropshadow)"
        letter-spacing="${Math.round(fontSize * 0.14)}"
      >OBGillustrator.com</text>
    </svg>
  `)
}

async function processImage(srcPath, outDir, filename) {
  const ext = path.extname(filename).toLowerCase()
  const baseName = path.basename(filename, ext)
  const outName = slugify(baseName) + '.jpg'
  const outPath = path.join(outDir, outName)

  console.log(`  → processing: ${filename}`)
  const img = sharp(srcPath, { limitInputPixels: false })
  const meta = await img.metadata()
  const w = Math.min(meta.width, MAX_WIDTH)
  const h = Math.round((meta.height / meta.width) * w)

  const watermark = buildWatermarkSvg(w, h)

  await sharp(srcPath, { limitInputPixels: false })
    .rotate()
    .resize({ width: w, withoutEnlargement: true })
    .composite([{ input: watermark, blend: 'over' }])
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toFile(outPath)

  console.log(`  ✓ saved: ${outName}`)
  return { outName, baseName }
}

async function main() {
  const allPhotos = {}

  for (const [category, srcDir] of Object.entries(SOURCES)) {
    console.log(`\n📂 Processing category: ${category}`)
    const outDir = path.join(OUT_BASE, category)
    fs.mkdirSync(outDir, { recursive: true })

    const files = fs.readdirSync(srcDir).filter(f => /\.(tif|tiff|jpg|jpeg)$/i.test(f))
    allPhotos[category] = []

    for (const file of files) {
      const srcPath = path.join(srcDir, file)
      try {
        const { outName, baseName } = await processImage(srcPath, outDir, file)
        const title = cleanTitle(file)
        const exifDesc = await getExifDescription(srcPath)
        const description = (exifDesc && exifDesc.length > 20) ? exifDesc : getDescription(baseName)
        allPhotos[category].push({
          id: slugify(baseName),
          filename: outName,
          title,
          description,
          category,
        })
      } catch (err) {
        console.error(`  ✗ error on ${file}:`, err.message)
      }
    }
  }

  // Write photo data as a JS module
  const dataPath = 'c:/Users/mason/OneDrive/Desktop/Imad_website/photography/lib/photos.ts'
  const sizes = [
    { label: '8×10', price: 125 },
    { label: '11×14', price: 185 },
    { label: '16×20', price: 280 },
    { label: '20×30', price: 575 },
    { label: '24×36', price: 650 },
  ]

  const dataContent = `// Auto-generated by watermark processor — do not edit directly
export const PRINT_SIZES = ${JSON.stringify(sizes, null, 2)} as const

export const PRINT_MEDIUMS = ['Metal', 'Canvas'] as const
export type PrintMedium = typeof PRINT_MEDIUMS[number]

export interface Photo {
  id: string
  filename: string
  title: string
  description: string
  category: string
}

export const CATEGORIES: Record<string, { label: string; description: string }> = {
  nature: {
    label: 'Nature',
    description: 'Landscapes, wildlife, and the natural world — from the Mojave Desert to the Tuscan hills.',
  },
  'san-francisco': {
    label: 'San Francisco Bay',
    description: 'The bay, the bridges, and the light that makes this place unlike anywhere else.',
  },
}

export const photos: Record<string, Photo[]> = ${JSON.stringify(allPhotos, null, 2)}
`

  fs.writeFileSync(dataPath, dataContent)
  console.log(`\n✅ Photo data written to lib/photos.ts`)
  console.log(`\nSummary:`)
  for (const [cat, items] of Object.entries(allPhotos)) {
    console.log(`  ${cat}: ${items.length} photos`)
  }
}

main().catch(console.error)
