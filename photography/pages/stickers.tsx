import Layout from '../components/Layout'

const STICKER_MULE_URL = 'https://www.stickermule.com/obgillustrator'

const STICKERS = [
  { file: 'sasquatch-looking-at-stickers-stickers-page-icon.png', title: 'Sasquatch Looking at Stickers' },
  { file: 'kayaking-sasquatch-sticker.png', title: 'Kayaking Sasquatch' },
  { file: 'gaming-sasquatch.png', title: 'Gaming Sasquatch' },
  { file: 'crater-lake-sasquatch-no-text.png', title: 'Crater Lake Sasquatch' },
  { file: 'day-of-the-dead-sasquatch.png', title: 'Day of the Dead Sasquatch' },
  { file: 'sasquatch-artist.png', title: 'Sasquatch Artist' },
  { file: 'mountain-biking-sasquatch.png', title: 'Mountain Biking Sasquatch' },
  { file: 'owl-sticker.png', title: 'Owl' },
  { file: 'martial-artists-sasquatch.png', title: 'Martial Artists Sasquatch' },
  { file: 'sasquatch-fishing.png', title: 'Sasquatch Fishing' },
  { file: 'yoga-sitting-pose-sasquatch.png', title: 'Yoga Sasquatch' },
  { file: 'golfing-sasquatch.png', title: 'Golfing Sasquatch' },
]

export default function Stickers() {
  return (
    <Layout>
      {/* Header */}
      <div className="max-w-3xl mx-auto px-5 pt-16 sm:pt-20 pb-10 text-center">
        <p className="text-xs text-copper uppercase tracking-widest mb-4">AI Stickers</p>
        <h1 className="font-serif text-4xl sm:text-5xl text-ink mb-4 leading-tight">
          Original Character Designs
        </h1>
        <p className="text-mist leading-relaxed mb-8 max-w-sm mx-auto">
          Imad's original AI-assisted character sticker designs — Sasquatch in every situation imaginable.
          Available as singles and sets on Sticker Mule.
        </p>
        <a
          href={STICKER_MULE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-copper text-darkroom px-8 py-3 text-sm tracking-wider uppercase hover:bg-amber-600 transition-colors"
        >
          Shop on Sticker Mule
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      {/* Sticker grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
          {STICKERS.map(s => (
            <a
              key={s.file}
              href={STICKER_MULE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-2 touch-manipulation"
              aria-label={`${s.title} — shop on Sticker Mule`}
            >
              <div className="w-full aspect-square rounded-xl overflow-hidden bg-canvas/50 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center p-2">
                <img
                  src={`/stickers/${s.file}`}
                  alt={s.title}
                  className="w-full h-full object-contain select-none"
                  draggable={false}
                />
              </div>
              <p className="text-center text-[10px] text-mist leading-tight group-hover:text-copper transition-colors">
                {s.title}
              </p>
            </a>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-xs text-mist mb-4 opacity-70">More designs available on Sticker Mule</p>
          <a
            href={STICKER_MULE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-edge text-mist px-6 py-2.5 text-xs tracking-wider uppercase hover:border-shadow hover:text-edge transition-colors"
          >
            View All Stickers
            <svg className="h-3 w-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </Layout>
  )
}
