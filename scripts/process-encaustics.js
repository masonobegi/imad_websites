const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

sharp.cache(false)
sharp.concurrency(1)

const SRC = 'c:/Users/mason/Downloads/Encaustic Gallery for OBGillustrator.com-20260620T190510Z-3-001/Encaustic Gallery for OBGIllustrator.com'
const OUT = 'c:/Users/mason/OneDrive/Desktop/Imad_website/photography/public/fine-art/encaustics'
const MAX = 1920
const QUALITY = 88

// Fix known typos / forced title overrides (keyed by slug of raw parsed title)
const TITLE_OVERRIDES = {
  'tree-of-persistance': 'Tree of Persistence',
}

const DESCRIPTIONS = {
  'lavender-field': 'A field of lavender stretches to the horizon, its purple rows built up in luminous encaustic layers that capture the flower\'s sun-warmed haze. The ancient medium and the ancient crop share something — both require time, patience, and heat.',
  'alone-in-the-forest-sunrise': 'First light filters through a dense forest canopy, its warmth captured in translucent encaustic layers that seem to glow from within. The trees emerge slowly from morning shadow, the way the eye adjusts.',
  'aurora-imagined': 'An imagined aurora fills the sky in radiant ribbons of green and violet, built up in encaustic layers that give the light an almost physical presence. What the eye cannot hold, the wax does.',
  'bleeding-hearts': 'The drooping heart-shaped blooms of bleeding heart, each one a perfect small pendant, rendered in translucent encaustic layers of rose and white. The name is melodramatic; the flower is not.',
  'bouquet-to-go': 'A loosely arranged bouquet, bright and informal, caught in the moment before it finds a vase. Encaustic gives the petals a depth that other media rarely achieves — layers of color visible beneath layers of wax.',
  'engraved-monarch': 'A monarch butterfly rendered with an engraving-like precision, its wing patterns drawn into the encaustic surface before being fused. The result is both painting and drawing, both ancient technique and close observation.',
  'fibroblast': 'A microscopic world made visible — the cellular architecture of biological tissue abstracted into color and texture. Encaustic\'s layering quality mirrors the way cells build and repair.',
  'fields-of-mustard': 'California\'s winter hills carpeted in wild mustard, their yellow brilliant against the dark green of the wet season. The encaustic surface gives the scene a warmth that the landscape itself also carries, unexpectedly, in January.',
  'fiftieth-anniversary': 'A painting marking fifty years — the encaustic surface, built layer by patient layer, is itself a metaphor for what accumulates over time. The image holds warmth, depth, and a weight appropriate to the occasion.',
  'fire-in-the-sky': 'The sky on fire at sunset, its oranges and magentas captured in fused wax that holds color with a particular luminosity. Encaustic was made for this — no other medium quite matches the way fire light fills space.',
  'flower-field-under-mount-hood': 'Oregon\'s wildflower meadows with Mount Hood rising white in the distance, the mountain\'s permanence set against the seasonal abundance below. Painted in encaustic layers that preserve the scene\'s depth and spaciousness.',
  'fog-over-oakland': 'Oakland\'s hills veiled in the marine layer that rolls in off the bay most mornings, the city\'s edges softened and its light gone silver. Encaustic\'s semi-translucent layers suit the subject perfectly.',
  'good-luck-birds': 'A composition of birds understood as symbols of fortune across many cultures — painted in encaustic with the clarity of folk art and the depth of the medium. Good luck made visible.',
  'gothic-decorations': 'Architectural ornament in the Gothic tradition — pointed arches, tracery, stone-carved flora — studied closely and translated into encaustic. The ancient building material and the ancient painting medium share an affinity.',
  'green-abstract-fabric': 'The rich folds and drape of green fabric, its movement frozen in encaustic layers that catch the light as actual cloth would. An exercise in pure paint: form, color, and texture without narrative.',
  'heart-rising-over-poppy-field': 'The artist\'s recurring heart motif lifts above a field of orange poppies, the encaustic sky luminous around it. Love and California wildflowers — both are brief, both are brilliant.',
  'heart-rising-over-tuscany': 'The heart motif over the rolling hills of Tuscany, its golden browns and sage greens recognizable to anyone who has seen that landscape. Encaustic gives the hills their dusty, afternoon-light warmth.',
  'heart-rising-over-the-ocean': 'The heart ascends above open water, the ocean rendered in deep encaustic blues and the horizon kept clean. A small painting with simple ambitions — transcendence above the sea.',
  'heart-rising-over-mount-hood': 'Oregon\'s dominant peak beneath the ascending heart, the mountain\'s permanence set in counterpoint to what the heart signifies. Encaustic layers give the snow cap its cold, flat light.',
  'hugged-by-clouds': 'A form embraced by clouds, the encaustic medium\'s translucency giving the clouds a softness that feels genuinely atmospheric. To be surrounded by clouds is to be held by something vast and gentle.',
  'lady-bugs-me': 'A close study of a ladybug on branch, encaustic\'s layering allowing the shell\'s lacquered red to glow. The title admits what the painting knows — sometimes the small thing is the whole thing.',
  'leaves-are-falling': 'Autumn leaves mid-fall, their descent caught and held in encaustic. The turning colors — ochre, rust, amber — are what encaustic does best: color with depth, color with warmth built in.',
  'lemon-lime-organelles': 'A microscopic-inspired composition: the cellular structures of citrus, their essential geometry made visible and beautiful. The sour and the sweet of lemon and lime, translated into pigment and wax.',
  'lemon-tree': 'A lemon tree laden with fruit, the yellow of the lemons vivid against green leaves. Encaustic\'s saturated quality suits the painting\'s sense of abundance.',
  'lone-snow-tree': 'A single tree standing in snow, its bare branches making their own drawing against a white sky. Winter stillness — the kind that makes you stop.',
  'milagros-on-green': 'The traditional Mexican milagros — small metal charms used as votive offerings — arranged on a ground of deep green encaustic. Faith made portable, devotion made beautiful.',
  'my-butterfly-collection': 'A collector\'s arrangement of butterfly specimens, each one rendered in precise encaustic detail that captures the wings\' patterns and iridescence. The reminder that beauty was once alive.',
  'peacock-on-display': 'A peacock in full display, its iridescent eye-spotted train spread wide. Encaustic is ideal for this — its layers capture the way peacock feathers seem to contain their own light source.',
  'poppy-field': 'A field of poppies at their peak, the orange vivid against green stems. One of the larger works, its scale matching the ambition of the subject.',
  'poppy-field-after-monet': 'Homage to Monet\'s poppy fields: the dappled light, the color pressing in from all sides. Encaustic gives the poppies Monet\'s luminosity through a different material logic.',
  'red-poppies': 'A close study of red poppies — their tissue-paper petals, their dark centers — painted in encaustic that gives the reds their full saturation. Not the field, but the flower itself.',
  'red-poppy': 'A single red poppy rendered with care, its petals cupped and its center visible. Encaustic\'s surface invites inspection — the closer you look, the more the layers reveal.',
  'red-siding-in-mexico': 'The vivid red exterior walls of a Mexican building, their paint aged and weathered in ways that encaustic can render with surprising accuracy. Color that has lived through decades of sun.',
  'reflected-trees': 'Trees reflected in still water, the mirrored image as precise as the real one. Encaustic layers give the reflection a depth that makes the boundary between above and below unclear.',
  'san-francisco-panoramic': 'The San Francisco Bay panoramic view: bridge, skyline, water, and light, rendered in encaustic across a long horizontal format. The city has been painted many times; encaustic finds in it something still new.',
  'seed-pods-in-the-dirt': 'The spent seed pods of various plants lying in bare earth, their architecture intricate and their season over. A quiet study of what remains after bloom, rendered with close attention.',
  'serinic-marsh-land': 'A marshland in stillness, the reeds and grasses built up in encaustic layers that give the scene its particular quiet. Tranquility rendered visible.',
  'spiraling-out': 'An abstract composition in spiral movement, the forms built up in encaustic layers that give the spiral its physical energy. Things expanding — or unwinding — both at once.',
  'spirited-away': 'A world encountered and a self transformed, held in encaustic color and form. The title evokes passage — arriving somewhere you didn\'t expect, leaving something behind.',
  'star-papaya': 'A cross-section of papaya, its seeds arranged in a perfect natural star, captured in tropical warmth. The fruit\'s interior — usually discarded — is here the entire subject.',
  'stella-aurora': 'Aurora and stars together: the celestial light show rendered in encaustic blues and greens that glow with an inner warmth. Named for the star-born dawn.',
  'sunrise-over-the-ocean': 'The sun rising over open water, its light building from the horizon in encaustic layers that capture the dawn\'s particular gradient of color.',
  'taken-away': 'A painting about absence — what is here, and what is not. Encaustic\'s surface, with its translucent layers, is suited to subjects that are partly about what lies beneath.',
  'tree-of-persistence': 'A tree that has survived — bent by wind, shaped by time, but upright still. Encaustic layers give the bark its texture and the whole composition its sense of endurance.',
  'trees-sunrise': 'Trees at dawn, their forms silhouetted or lit depending on their angle to the rising light. A small painting that holds a large moment.',
  'windows-on-tuscany': 'The windows of a Tuscan farmhouse, their shutters and sills and the light they frame rendered in encaustic. The view through a window is always partly about the window itself.',
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function parseFilename(raw) {
  let s = raw.replace(/\.(jpe?g|png)$/i, '')

  const available = /\bavailable\b/i.test(s)

  // Remove "- Available" / "-Available" / "Available" with variants
  s = s.replace(/\s*[-–]\s*Available\b\s*/gi, ' ')
  s = s.replace(/\bAvailable\b\s*/gi, ' ')

  // Remove date/camera codes (must come before underscore replacement)
  s = s.replace(/[\s_]?(20\d{6}[_]\d{6})([_]\w+)*\s*$/i, '')      // 20231206_191336, _rtch, _full_frame
  s = s.replace(/\s+IMG_\d[\d_]*\s*$/i, '')                         // IMG_0056, IMG_20200612_095253_752
  s = s.replace(/\s+DSC\d+\s*$/i, '')                               // DSC04524
  s = s.replace(/\s+\d{4}-\d{2}-\d{2}\s+\d{2}\.\d{2}\.\d{2}\s*$/, '') // 2018-06-25 22.34.10

  // Extract size from patterns like "6_ x 6_", "8_ x 10_", "6_x 12_"
  const sizeMatch = s.match(/(\d+)[_.]?\s*[xX×]\s*(\d+)[_.]?/)
  let originalSize = null
  if (sizeMatch) {
    originalSize = `${sizeMatch[1]}" × ${sizeMatch[2]}"`
  }

  // Remove size patterns
  s = s.replace(/\d+[_.]?\s*[xX×]\s*\d+[_.]?/g, '')

  // Remove medium/panel descriptions (order matters — longest first)
  s = s.replace(/\bEncaus?tic\s+on\s+Flat\s+Panel\b/gi, '')
  s = s.replace(/\bEncaus?tic\s+Cradled\s+Panel\b/gi, '')
  s = s.replace(/\bEncaus?tic\s+Flat\s+Panel\b/gi, '')
  s = s.replace(/\bEncaus?tic\s+on\s+Paper\b/gi, '')
  s = s.replace(/\bEncaus?tic\s+Cradled\b/gi, '')
  s = s.replace(/\bCradled\s+Panel\b/gi, '')
  s = s.replace(/\bFlat\s+Panel\b/gi, '')
  s = s.replace(/\bEncaus?tic\b/gi, '')
  s = s.replace(/\bCradled\b/gi, '')
  s = s.replace(/\bPanel\b/gi, '')

  // Replace underscores (field separators) with spaces
  s = s.replace(/_/g, ' ')

  // Normalize whitespace
  s = s.replace(/\s+/g, ' ').trim()
  s = s.replace(/^[\s-]+|[\s-]+$/g, '').trim()

  return { title: s, available, originalSize }
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })

  const files = fs.readdirSync(SRC).filter(f => /\.(jpe?g|png)$/i.test(f)).sort()
  const works = []

  for (const file of files) {
    const srcPath = path.join(SRC, file)
    const { title: rawTitle, available, originalSize } = parseFilename(file)

    // Apply title overrides (fix typos)
    const rawSlug = slugify(rawTitle)
    const title = TITLE_OVERRIDES[rawSlug] ? TITLE_OVERRIDES[rawSlug] : rawTitle
    const slug = slugify(title)
    const outName = slug + '.jpg'
    const outPath = path.join(OUT, outName)

    console.log(`→ ${file}`)
    console.log(`  title: "${title}" | size: ${originalSize} | available: ${available} | slug: ${slug}`)

    try {
      const img = sharp(srcPath, { limitInputPixels: false })
      const meta = await img.metadata()
      const w = Math.min(meta.width, MAX)

      await sharp(srcPath, { limitInputPixels: false })
        .rotate()
        .resize({ width: w, withoutEnlargement: true })
        .jpeg({ quality: QUALITY, mozjpeg: true })
        .toFile(outPath)

      console.log(`  ✓ saved ${outName}`)

      const description = DESCRIPTIONS[slug] || `An original encaustic painting by Imad Obegi. Pigmented beeswax on panel, built up in luminous layers.`

      works.push({ id: slug, filename: outName, title, originalSize, available, description })
    } catch (err) {
      console.error(`  ✗ error: ${err.message}`)
    }
  }

  console.log(`\n✅ Processed ${works.length} encaustic works`)
  console.log('\n=== DATA (copy into data.json) ===')
  console.log(JSON.stringify(works, null, 2))
}

main().catch(console.error)
