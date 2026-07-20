import { useState } from 'react'
import Head from 'next/head'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import Layout from '../../components/Layout'
import PhotoModal from '../../components/PhotoModal'
import CartPopup from '../../components/CartPopup'
import { Photo } from '../../lib/photos'

interface PrintSize { label: string; price: number }

interface Props {
  category: string
  categoryLabel: string
  categoryDescription: string
  items: Photo[]
  printSizes: PrintSize[]
}

export default function GalleryPage({ category, categoryLabel, categoryDescription, items, printSizes }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <Layout>
      <Head>
        <title>{categoryLabel} Photography | OBGillustrator.com</title>
        <meta name="description" content={categoryDescription} />
        <meta property="og:title" content={`${categoryLabel} Photography Prints | OBGillustrator.com`} />
        <meta property="og:description" content={categoryDescription} />
        {items[0] && <meta property="og:image" content={`https://obgillustrator.com/photos/${category}/${items[0].filename}`} />}
      </Head>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-16">

        <div className="mb-8">
          <p className="text-xs text-mist mb-3">
            <Link href="/shop" className="hover:text-copper transition-colors">Shop</Link>
            <span className="mx-2 opacity-40">›</span>
            {categoryLabel}
          </p>
          <h1 className="font-serif text-3xl text-ink">{categoryLabel}</h1>
          <p className="text-mist text-sm mt-1 max-w-md">{categoryDescription}</p>
        </div>

        {items.length === 0 ? (
          <div className="py-20 text-center text-mist text-sm">
            No photos found in this collection.
          </div>
        ) : (
          <div className="photo-grid">
            {items.map((photo, i) => (
              <div key={photo.id} className="photo-item">
                <button
                  onClick={() => setSelectedIndex(i)}
                  className="group block w-full text-left focus:outline-none"
                >
                  <div className="relative photo-wrapper overflow-hidden bg-canvas">
                    <img
                      src={`/photos/${category}/${photo.filename}?v=3`}
                      alt={photo.title}
                      className="w-full block object-cover transition-transform duration-500 group-hover:scale-[1.03] photo-protected"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 flex items-end">
                      <div className="p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <p className="text-edge text-sm font-medium leading-snug">{photo.title}</p>
                        <p className="text-copper text-xs mt-0.5 uppercase tracking-wider">View print →</p>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedIndex !== null && (
        <PhotoModal
          photos={items}
          initialIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onAddedToCart={() => { setSelectedIndex(null); setCartOpen(true) }}
          printSizes={printSizes}
        />
      )}
      {cartOpen && <CartPopup onClose={() => setCartOpen(false)} dark />}
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const category = params?.category as string
  const { prisma } = await import('../../lib/prisma')

  const [cat, photos, printSizes] = await Promise.all([
    prisma.photoCategory.findUnique({ where: { slug: category } }),
    prisma.photo.findMany({ where: { category }, orderBy: { sortOrder: 'asc' } }),
    prisma.printSize.findMany({ orderBy: { sortOrder: 'asc' } }),
  ])

  if (!cat) return { notFound: true }

  return {
    props: {
      category,
      categoryLabel: cat.label,
      categoryDescription: cat.description,
      items: photos.map(p => ({ id: p.id, filename: p.filename, title: p.title, description: p.description, category: p.category })),
      printSizes: printSizes.map(s => ({ label: s.label, price: s.price })),
    },
  }
}
