import { useState } from 'react'
import { GetStaticPaths, GetStaticProps } from 'next'
import Link from 'next/link'
import Layout from '../../components/Layout'
import PhotoModal from '../../components/PhotoModal'
import CartPopup from '../../components/CartPopup'
import { photos, CATEGORIES, Photo } from '../../lib/photos'

interface Props {
  category: string
  categoryLabel: string
  categoryDescription: string
  items: Photo[]
}

export default function GalleryPage({ category, categoryLabel, categoryDescription, items }: Props) {
  const [selected, setSelected] = useState<Photo | null>(null)
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <Layout dark>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-16">

        {/* Breadcrumb + heading */}
        <div className="mb-8">
          <p className="text-xs text-mist mb-3">
            <Link href="/shop" className="hover:text-copper transition-colors">Shop</Link>
            <span className="mx-2 opacity-40">›</span>
            {categoryLabel}
          </p>
          <h1 className="font-serif text-3xl text-edge">{categoryLabel}</h1>
          <p className="text-mist text-sm mt-1 max-w-md">{categoryDescription}</p>
        </div>

        {/* Masonry grid */}
        {items.length === 0 ? (
          <div className="py-20 text-center text-mist text-sm">
            Images are being processed — refresh in a minute.
          </div>
        ) : (
          <div className="photo-grid">
            {items.map(photo => (
              <div key={photo.id} className="photo-item">
                <button
                  onClick={() => setSelected(photo)}
                  className="group block w-full text-left focus:outline-none"
                >
                  <div className="relative photo-wrapper overflow-hidden bg-panel">
                    <img
                      src={`/photos/${category}/${photo.filename}`}
                      alt={photo.title}
                      className="w-full block object-cover transition-transform duration-500 group-hover:scale-[1.03] photo-protected"
                      loading="lazy"
                    />
                    {/* Hover overlay */}
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

      {selected && (
        <PhotoModal
          photo={selected}
          onClose={() => setSelected(null)}
          onAddedToCart={() => { setSelected(null); setCartOpen(true) }}
        />
      )}
      {cartOpen && <CartPopup onClose={() => setCartOpen(false)} dark />}
    </Layout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: Object.keys(CATEGORIES).map(category => ({ params: { category } })),
  fallback: false,
})

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const category = params?.category as string
  const cat = CATEGORIES[category]
  if (!cat) return { notFound: true }

  return {
    props: {
      category,
      categoryLabel: cat.label,
      categoryDescription: cat.description,
      items: photos[category] || [],
    },
  }
}
