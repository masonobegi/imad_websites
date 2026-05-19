import { Product } from '../lib/products'

interface ProductCardProps {
  product: Product
  onSelect: (product: Product) => void
}

export default function ProductCard({ product, onSelect }: ProductCardProps) {
  const startingPrice = Math.min(...product.sizes.map(s => s.price))

  return (
    <button
      onClick={() => onSelect(product)}
      className="group text-left w-full focus:outline-none"
    >
      <div
        className="w-full aspect-square flex items-center justify-center text-6xl mb-3 rounded-sm transition-opacity group-hover:opacity-90"
        style={{ backgroundColor: product.color + '28' }}
      >
        <span className="group-hover:scale-105 transition-transform duration-300 inline-block select-none">
          {product.emoji}
        </span>
      </div>
      <p className="font-serif text-ink text-base leading-snug">{product.name}</p>
      <p className="text-xs text-clay mt-0.5">{product.medium}</p>
      <p className="text-sm text-bark mt-1.5">from ${startingPrice}</p>
    </button>
  )
}
