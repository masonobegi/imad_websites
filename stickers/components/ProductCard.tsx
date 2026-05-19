import { StickerProduct } from '../lib/products'

interface ProductCardProps {
  product: StickerProduct
  onSelect: (product: StickerProduct) => void
}

export default function ProductCard({ product, onSelect }: ProductCardProps) {
  return (
    <button
      onClick={() => onSelect(product)}
      className="group text-left w-full focus:outline-none"
    >
      <div
        className="w-full aspect-square flex items-center justify-center text-6xl mb-3 rounded-xl transition-opacity group-hover:opacity-90"
        style={{ backgroundColor: product.color + '22' }}
      >
        <span className="group-hover:scale-110 transition-transform duration-300 inline-block select-none">
          {product.emoji}
        </span>
      </div>
      <p className="font-semibold text-ink text-base leading-snug">{product.name}</p>
      <p className="text-xs text-amber mt-0.5">{product.packSize}</p>
      <p className="text-sm text-ember font-semibold mt-1.5">${product.price.toFixed(2)}</p>
    </button>
  )
}
