import Head from 'next/head'
import Link from 'next/link'
import Layout from '../components/Layout'

export default function About() {
  return (
    <Layout>
      <Head>
        <title>About Imad | OBGillustrator.com</title>
        <meta name="description" content="Imad Obegi is a fine art photographer, painter, and illustrator whose work spans encaustic painting, oils, pastels, watercolor, and photography." />
        <meta property="og:title" content="About Imad | OBGillustrator.com" />
        <meta property="og:description" content="Artist, photographer, and illustrator. Thirty years across painting, photography, and illustration." />
        <meta property="og:image" content="/imad-portrait.jpg" />
      </Head>

      {/* Hero — one of his photos as backdrop */}
      <section className="relative h-[45vh] overflow-hidden photo-wrapper">
        <img
          src="/photos/nature/milky-way-over-joshua-tree.jpg"
          alt="Photography by Imad"
          className="absolute inset-0 w-full h-full object-cover object-center photo-protected"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/30 to-transparent" />
      </section>

      {/* Main content */}
      <section className="max-w-4xl mx-auto px-5 sm:px-10 py-14 sm:py-20">

        <div className="flex flex-col sm:flex-row gap-10 sm:gap-16">

          {/* Portrait */}
          <div className="flex-shrink-0 sm:w-56">
            <div className="w-44 sm:w-56 aspect-[3/4] overflow-hidden bg-edge">
              <img
                src="/imad-portrait.jpg"
                alt="Imad Obegi"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-xs text-mist mt-3 leading-snug">
              Imad Obegi<br />
              OBGillustrator.com<br />
              Bay Area, California
            </p>
          </div>

          {/* Bio */}
          <div className="flex-1">
            <p className="text-xs text-copper uppercase tracking-widest mb-4">Artist · Photographer</p>
            <h1 className="font-serif text-4xl sm:text-5xl text-ink mb-8 leading-tight">Imad Obegi</h1>

            <div className="space-y-5 text-mist text-base leading-relaxed">
              <p>
                Imad Obegi's creative journey began in childhood, where an instinct for color and
                composition surfaced before he had the words to describe it. What started as a natural
                inclination grew into a lifelong practice spanning five decades.
              </p>
              <p>
                He works across encaustic painting, oils, pastels, watercolor, and photography —
                each medium a different way of seeing the same world. His work is rooted in a deep
                appreciation for the beauty that exists in nature: the light on open water, the silence
                of a desert at night, the intricate life in a single flower.
              </p>
              <p>
                An extensive background in portraiture and figure drawing informs everything he makes.
                Whether photographing the Milky Way over Joshua Tree or layering encaustic wax on a
                painted surface, the intention is the same — to draw out something specific in the person
                looking at it.
              </p>
              <p>
                The photography prints available here are places Imad has actually been, light he
                waited for, moments that don't repeat. Each print is made to order on archival metal
                or canvas.
              </p>
            </div>

            {/* Mediums */}
            <div className="mt-10 pt-8 border-t border-edge">
              <p className="text-xs text-mist uppercase tracking-widest mb-4">Works in</p>
              <div className="flex flex-wrap gap-2">
                {['Photography', 'Encaustic Painting', 'Oil', 'Pastels', 'Watercolor', 'Illustration'].map(m => (
                  <span key={m} className="text-xs border border-edge text-mist px-3 py-1.5">
                    {m}
                  </span>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="mt-10 pt-8 border-t border-edge">
              <p className="text-xs text-mist uppercase tracking-widest mb-4">Contact</p>
              <div className="space-y-1 text-sm">
                <p>
                  <a href="mailto:imadobegi@gmail.com" className="text-copper hover:text-shadow transition-colors">
                    imadobegi@gmail.com
                  </a>
                </p>
                <p>
                  <a href="tel:6504839838" className="text-mist hover:text-copper transition-colors">
                    650-483-9838
                  </a>
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Photography CTA */}
        <div className="mt-16 pt-10 border-t border-edge flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-serif text-xl text-ink mb-1">Browse the photography prints</p>
            <p className="text-mist text-sm">42 photographs available on metal or canvas</p>
          </div>
          <Link
            href="/shop"
            className="flex-shrink-0 border border-ink text-ink px-8 py-3 text-sm tracking-wider uppercase hover:bg-ink hover:text-canvas transition-colors"
          >
            Shop Prints
          </Link>
        </div>
      </section>
    </Layout>
  )
}
