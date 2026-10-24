import { ArrowLeft, Clock, Flame, MessageSquare, ShoppingBag } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { toast } from 'sonner'
import { menuApi } from '../api'
import { errorMessage } from '../api/client'
import FavoriteButton from '../components/menu/FavoriteButton'
import { Badge } from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { ErrorState, PageLoader } from '../components/ui/Feedback'
import { Textarea } from '../components/ui/Field'
import ProductImage from '../components/ui/ProductImage'
import QuantityStepper from '../components/ui/QuantityStepper'
import { Stars } from '../components/ui/Stars'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { formatCOP, formatDateTime, initials } from '../utils/format'

export default function ProductDetail() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const { add, open, maxQty } = useCart()
  const { isAuthenticated, canOrder } = useAuth()
  useDocumentTitle(product?.name)

  useEffect(() => {
    setProduct(null)
    setError(null)
    menuApi
      .product(slug)
      .then((res) => setProduct(res.data))
      .catch((e) => setError(e.response?.status === 404 ? 'Este plato no existe o ya no está disponible.' : errorMessage(e)))
  }, [slug])

  if (error) return <div className="container-app py-16"><ErrorState message={error} /></div>
  if (!product) return <PageLoader />

  const addToCart = () => {
    add(product, quantity, notes.trim())
    toast.success(`${quantity} × ${product.name} en tu carrito`, {
      action: { label: 'Ver carrito', onClick: open },
    })
    setQuantity(1)
    setNotes('')
  }

  return (
    <div className="container-app py-8">
      <Link to="/menu" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Volver al menú
      </Link>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="relative">
          <div className="sticky top-24 overflow-hidden rounded-[32px] shadow-[var(--shadow-lift)]">
            <ProductImage src={product.image_url} alt={product.name} className="aspect-square w-full lg:aspect-[4/3.6]" />
            {product.badge && <Badge className="absolute top-5 left-5 bg-accent-500 px-3 py-1.5 text-sm text-white">{product.badge}</Badge>}
            <FavoriteButton product={product} className="absolute top-5 right-5 h-11 w-11" />
          </div>
        </div>

        <div className="animate-fade-in">
          <Link to={`/menu?category=${product.category.slug}`} className="text-sm font-bold tracking-wide text-brand-600 uppercase hover:text-brand-700">
            {product.category.name}
          </Link>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{product.name}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            {product.rating_count > 0 ? (
              <span className="flex items-center gap-2">
                <Stars value={product.rating_avg} />
                <span className="font-bold">{product.rating_avg.toFixed(1)}</span>
                <span className="text-muted">({product.rating_count} reseñas)</span>
              </span>
            ) : (
              <span className="text-muted">Sin reseñas aún</span>
            )}
            <span className="flex items-center gap-1.5 text-muted"><Clock className="h-4 w-4" /> {product.prep_minutes} min</span>
            {product.sold_count > 0 && (
              <span className="flex items-center gap-1.5 text-muted"><Flame className="h-4 w-4 text-accent-500" /> {product.sold_count} pedidos</span>
            )}
          </div>

          <p className="mt-6 text-lg leading-relaxed text-muted">{product.description}</p>
          <p className="mt-6 text-3xl font-extrabold">{formatCOP(product.price)}</p>

          {(!isAuthenticated || canOrder) && (
            <div className="card mt-8 space-y-5 p-6">
              <Textarea
                label="¿Alguna indicación para la cocina?"
                placeholder="Ej.: sin cebolla, salsa aparte, término medio…"
                value={notes}
                maxLength={200}
                onChange={(e) => setNotes(e.target.value)}
              />
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <QuantityStepper value={quantity} onChange={setQuantity} max={maxQty} />
                <Button size="lg" className="flex-1" onClick={addToCart}>
                  <ShoppingBag className="h-5 w-5" /> Agregar · {formatCOP(product.price * quantity)}
                </Button>
              </div>
            </div>
          )}

          <section className="mt-12">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <MessageSquare className="h-5 w-5 text-brand-500" /> Lo que dicen nuestros clientes
            </h2>
            {product.reviews.length === 0 ? (
              <p className="mt-3 text-muted">Sé el primero en calificarlo después de recibir tu pedido.</p>
            ) : (
              <ul className="mt-5 space-y-4">
                {product.reviews.map((r) => (
                  <li key={r.id} className="card p-5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">{initials(r.author)}</span>
                      <div className="flex-1">
                        <p className="text-sm font-bold">{r.author}</p>
                        <p className="text-xs text-muted">{formatDateTime(r.created_at)}</p>
                      </div>
                      <Stars value={r.rating} />
                    </div>
                    {r.comment && <p className="mt-3 leading-relaxed text-ink/80">{r.comment}</p>}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
