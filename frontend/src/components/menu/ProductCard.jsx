import { Clock, Plus, Star } from 'lucide-react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { formatCOP } from '../../utils/format'
import { Badge } from '../ui/Badge'
import ProductImage from '../ui/ProductImage'
import QuantityStepper from '../ui/QuantityStepper'
import FavoriteButton from './FavoriteButton'

export default function ProductCard({ product, onFavoriteChange }) {
  const { add, quantityOf, setQuantity } = useCart()
  const { isAuthenticated, canOrder } = useAuth()
  const inCart = quantityOf(product.id)
  const canAdd = !isAuthenticated || canOrder

  const quickAdd = (e) => {
    e.preventDefault()
    add(product)
    toast.success(`${product.name} agregado`, { description: 'Ábrelo desde el carrito cuando quieras pedir.' })
  }

  return (
    <Link
      to={`/menu/${product.slug}`}
      className="group card flex flex-col overflow-hidden transition duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <ProductImage src={product.image_url} alt={product.name} className="h-full w-full transition duration-500 group-hover:scale-105" />
        {product.badge && <Badge className="absolute top-3 left-3 bg-accent-500 text-white shadow">{product.badge}</Badge>}
        <FavoriteButton product={product} onChange={onFavoriteChange} className="absolute top-3 right-3" />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-1.5 flex items-center gap-3 text-xs font-semibold text-muted">
          {product.rating_count > 0 && (
            <span className="flex items-center gap-1 text-ink">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {product.rating_avg.toFixed(1)}
              <span className="font-normal text-muted">({product.rating_count})</span>
            </span>
          )}
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {product.prep_minutes} min</span>
        </div>
        <h3 className="text-[17px] font-bold leading-snug group-hover:text-brand-600">{product.name}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">{product.description}</p>

        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-lg font-extrabold">{formatCOP(product.price)}</span>
          {canAdd &&
            (inCart > 0 ? (
              <div onClick={(e) => e.preventDefault()}>
                <QuantityStepper size="sm" value={inCart} min={0} onChange={(q) => setQuantity(product.id, q)} />
              </div>
            ) : (
              <button
                onClick={quickAdd}
                className="flex h-10 items-center gap-1.5 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white shadow-sm shadow-brand-500/30 transition hover:bg-brand-600 active:scale-95"
              >
                <Plus className="h-4 w-4" /> Agregar
              </button>
            ))}
        </div>
      </div>
    </Link>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-[4/3] animate-pulse bg-slate-200/70" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-24 animate-pulse rounded bg-slate-200/70" />
        <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200/70" />
        <div className="h-4 w-full animate-pulse rounded bg-slate-200/70" />
        <div className="flex justify-between pt-2">
          <div className="h-6 w-20 animate-pulse rounded bg-slate-200/70" />
          <div className="h-10 w-24 animate-pulse rounded-xl bg-slate-200/70" />
        </div>
      </div>
    </div>
  )
}
