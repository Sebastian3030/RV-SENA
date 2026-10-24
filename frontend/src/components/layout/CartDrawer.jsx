import { ArrowRight, ShoppingBag, Trash2, X } from 'lucide-react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { formatCOP } from '../../utils/format'
import Button from '../ui/Button'
import ProductImage from '../ui/ProductImage'
import QuantityStepper from '../ui/QuantityStepper'

export default function CartDrawer() {
  const { items, isOpen, close, subtotal, count, setQuantity, remove, maxQty } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => e.key === 'Escape' && close()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, close])

  if (!isOpen) return null

  const goToCheckout = () => {
    close()
    navigate(isAuthenticated ? '/checkout' : '/login', { state: { from: '/checkout' } })
  }

  return createPortal(
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Carrito">
      <div className="animate-fade-in absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={close} />
      <aside className="animate-slide-in absolute top-0 right-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <div>
            <h2 className="text-lg font-bold">Tu pedido</h2>
            <p className="text-sm text-muted">{count} {count === 1 ? 'producto' : 'productos'}</p>
          </div>
          <button onClick={close} className="rounded-lg p-2 text-muted hover:bg-slate-100 hover:text-ink" aria-label="Cerrar carrito">
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-50">
              <ShoppingBag className="h-9 w-9 text-brand-500" />
            </div>
            <p className="text-lg font-bold">Tu carrito está vacío</p>
            <p className="mt-1 text-muted">Explora el menú y agrega lo que se te antoje.</p>
            <Button className="mt-6" to="/menu" onClick={close}>Ver el menú</Button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4 py-4">
                  <Link to={`/menu/${item.slug}`} onClick={close} className="shrink-0">
                    <ProductImage src={item.image_url} alt={item.name} className="h-20 w-20 rounded-2xl" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold leading-snug">{item.name}</p>
                      <button onClick={() => remove(item.id)} className="rounded-md p-1 text-muted hover:bg-red-50 hover:text-red-600" aria-label={`Quitar ${item.name}`}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {item.notes && <p className="truncate text-xs text-muted">Nota: {item.notes}</p>}
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <QuantityStepper size="sm" value={item.quantity} min={0} max={maxQty} onChange={(q) => setQuantity(item.id, q)} />
                      <span className="font-bold">{formatCOP(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-line bg-canvas/60 px-6 py-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-muted">Subtotal</span>
                <span className="text-xl font-extrabold">{formatCOP(subtotal)}</span>
              </div>
              <Button size="lg" className="w-full" onClick={goToCheckout}>
                {isAuthenticated ? 'Continuar con el pedido' : 'Ingresa para pedir'} <ArrowRight className="h-5 w-5" />
              </Button>
              <p className="mt-3 text-center text-xs text-muted">Envío y descuentos se calculan en el siguiente paso.</p>
            </div>
          </>
        )}
      </aside>
    </div>,
    document.body,
  )
}
