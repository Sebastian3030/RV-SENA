import { ArrowLeft, Clock, MapPin, PartyPopper, RefreshCw, Star } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { toast } from 'sonner'
import { menuApi, orderApi } from '../api'
import { errorMessage } from '../api/client'
import OrderTimeline from '../components/orders/OrderTimeline'
import { StatusBadge } from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { ErrorState, PageLoader } from '../components/ui/Feedback'
import { Textarea } from '../components/ui/Field'
import Modal from '../components/ui/Modal'
import ProductImage from '../components/ui/ProductImage'
import { StarInput } from '../components/ui/Stars'
import { usePolling } from '../hooks/usePolling'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { formatCOP, formatDateTime, minutesSince } from '../utils/format'

const FINAL = ['entregado', 'cancelado']

function ReviewModal({ item, onClose, onDone }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [sending, setSending] = useState(false)

  const send = async () => {
    setSending(true)
    try {
      await menuApi.review(item.product_id, { rating, comment: comment.trim() || null })
      toast.success('¡Gracias por tu calificación!')
      onDone(item.product_id)
    } catch (error) {
      toast.error(errorMessage(error))
      if (error.response?.status === 422) onDone(item.product_id)
    } finally {
      setSending(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Califica ${item.product_name}`}
      description="Tu opinión ayuda a otros clientes y a la cocina."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={send} loading={sending}>Enviar calificación</Button>
        </>
      }
    >
      <div className="space-y-5">
        <StarInput value={rating} onChange={setRating} />
        <Textarea label="Comentario (opcional)" placeholder="¿Qué te gustó? ¿Qué mejorarías?" maxLength={500} value={comment} onChange={(e) => setComment(e.target.value)} />
      </div>
    </Modal>
  )
}

export default function OrderTracking() {
  const { code } = useParams()
  const location = useLocation()
  useDocumentTitle(`Pedido ${code}`)
  const [order, setOrder] = useState(null)
  const [error, setError] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [reviewing, setReviewing] = useState(null)
  const [reviewed, setReviewed] = useState([])

  const load = useCallback(() => {
    orderApi
      .show(code)
      .then((res) => {
        setReviewed(res.meta?.reviewed_product_ids ?? [])
        setOrder((prev) => {
          if (prev && prev.status !== res.data.status) {
            toast.info(`Tu pedido ahora está: ${res.data.status_label}`)
          }
          return res.data
        })
      })
      .catch((e) => setError(e.response?.status === 404 ? 'No encontramos este pedido.' : errorMessage(e)))
  }, [code])

  useEffect(load, [load])
  usePolling(load, 5000, Boolean(order) && !FINAL.includes(order.status))

  const cancel = async () => {
    if (!window.confirm('¿Seguro que quieres cancelar este pedido?')) return
    setCancelling(true)
    try {
      const res = await orderApi.cancel(code)
      setOrder(res.data)
      toast.success('Pedido cancelado')
    } catch (error) {
      toast.error(errorMessage(error))
      load()
    } finally {
      setCancelling(false)
    }
  }

  const markReviewed = (productId) => {
    setReviewed((list) => [...new Set([...list, productId])])
    setReviewing(null)
  }

  if (error) return <div className="container-app py-16"><ErrorState message={error} /></div>
  if (!order) return <PageLoader label="Buscando tu pedido…" />

  const live = !FINAL.includes(order.status)
  const eta = Math.max(0, 25 - minutesSince(order.created_at))

  return (
    <div className="container-app max-w-5xl py-10">
      <Link to="/pedidos" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Mis pedidos
      </Link>

      {location.state?.justPlaced && order.status === 'pendiente' && (
        <div className="animate-fade-in mb-6 flex items-center gap-4 rounded-2xl bg-brand-500 p-5 text-white shadow-lg shadow-brand-500/30">
          <PartyPopper className="h-8 w-8 shrink-0" />
          <div>
            <p className="text-lg font-bold">¡Pedido confirmado!</p>
            <p className="text-brand-50">La cocina ya lo recibió. Esta pantalla se actualiza sola.</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight">{order.code}</h1>
            <StatusBadge status={order.status} label={order.status_label} />
          </div>
          <p className="mt-1 text-muted">{formatDateTime(order.created_at)} · {order.type_label}</p>
        </div>
        {live && (
          <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-muted shadow-sm ring-1 ring-line">
            <RefreshCw className="h-4 w-4 animate-spin text-brand-500 [animation-duration:3s]" /> En vivo
          </span>
        )}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="card p-6 sm:p-8">
          {live && (
            <div className="mb-8 flex items-center gap-4 rounded-2xl bg-canvas p-5">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-sm">
                <Clock className="h-6 w-6" />
              </span>
              <div>
                <p className="text-sm text-muted">Tiempo estimado</p>
                <p className="text-xl font-extrabold">{eta > 0 ? `${eta} minutos` : 'Ya casi está'}</p>
              </div>
            </div>
          )}
          <OrderTimeline order={order} />
          {order.can_cancel && (
            <Button variant="danger" className="mt-8" onClick={cancel} loading={cancelling}>Cancelar pedido</Button>
          )}
        </section>

        <aside className="space-y-6">
          <div className="card p-6">
            <h2 className="font-bold">Detalle</h2>
            <ul className="mt-4 space-y-4">
              {order.items.map((item) => {
                const canReview = order.status === 'entregado' && item.product_id && !reviewed.includes(item.product_id)
                return (
                  <li key={item.id} className="flex gap-3">
                    <ProductImage src={item.image_url} alt={item.product_name} className="h-14 w-14 rounded-xl" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{item.quantity} × {item.product_name}</p>
                      {item.notes && <p className="text-xs text-muted">“{item.notes}”</p>}
                      {canReview && (
                        <button onClick={() => setReviewing(item)} className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700">
                          <Star className="h-3.5 w-3.5" /> Calificar
                        </button>
                      )}
                    </div>
                    <span className="text-sm font-bold">{formatCOP(item.subtotal)}</span>
                  </li>
                )
              })}
            </ul>
            <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatCOP(order.subtotal)}</dd></div>
              {order.discount > 0 && <div className="flex justify-between text-brand-600"><dt>Descuento {order.coupon_code && `(${order.coupon_code})`}</dt><dd>− {formatCOP(order.discount)}</dd></div>}
              {order.delivery_fee > 0 && <div className="flex justify-between"><dt className="text-muted">Envío</dt><dd>{formatCOP(order.delivery_fee)}</dd></div>}
              <div className="flex justify-between pt-1 text-base font-extrabold"><dt>Total</dt><dd>{formatCOP(order.total)}</dd></div>
            </dl>
          </div>

          <div className="card space-y-3 p-6 text-sm">
            <h2 className="text-base font-bold">Entrega y pago</h2>
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
              {order.type === 'mesa' && `Mesa ${order.table_number}`}
              {order.type === 'recoger' && 'Recoger en el mostrador'}
              {order.type === 'domicilio' && order.address}
            </p>
            <p className="text-muted">Pago: <span className="font-semibold text-ink">{order.payment_label}</span> al recibir</p>
            {order.notes && <p className="rounded-xl bg-canvas p-3 text-muted">“{order.notes}”</p>}
          </div>
        </aside>
      </div>

      {reviewing && <ReviewModal item={reviewing} onClose={() => setReviewing(null)} onDone={markReviewed} />}
    </div>
  )
}
