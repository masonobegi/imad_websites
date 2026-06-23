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
        <meta property="og:image" content="https://obgillustrator.com/imad-portrait.jpg" />
      </Head>

      {/* Hero — accent strip, not full scene */}
      <section className="relative h-[22vh] overflow-hidden photo-wrapper">
        <img
          src="/photos/nature/milky-way-over-joshua-tree.jpg"
          alt="Photography by Imad"
          className="absolute inset-0 w-full h-full object-cover object-[center_30%] photo-protected"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/20 to-transparent" />
      </section>

      {/* Main content */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 py-12 sm:py-16">

        <div className="flex flex-col sm:flex-row gap-10 sm:gap-16 lg:gap-20">

          {/* Portrait */}
          <div className="flex-shrink-0 sm:w-72 lg:w-80">
            <div className="w-full aspect-[3/4] overflow-hidden bg-edge">
              <img
                src="/imad-portrait.jpg"
                alt="Imad Obegi"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-sm text-mist mt-4 leading-snug">
              Imad Obegi<br />
              OBGillustrator.com<br />
              Bay Area, California
            </p>
          </div>

          {/* Bio */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-copper uppercase tracking-widest mb-4">Artist · Photographer</p>
            <h1 className="font-serif text-5xl sm:text-6xl text-ink mb-8 leading-tight">Imad Obegi</h1>

            <div className="space-y-5 text-mist text-lg leading-relaxed">
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

            {/* Social */}
            <div className="mt-10 pt-8 border-t border-edge">
              <p className="text-xs text-mist uppercase tracking-widest mb-4">Follow</p>
              <div className="flex items-center gap-5">
                <a href="https://www.instagram.com/imadobegi/" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-mist hover:text-copper transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  @imadobegi
                </a>
                <a href="https://www.facebook.com/imad.obegi/" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-mist hover:text-copper transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>
    </Layout>
  )
}
