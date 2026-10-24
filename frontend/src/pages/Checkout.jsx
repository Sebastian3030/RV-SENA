import { ArrowLeft, BadgePercent, Check, ShoppingBag, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { orderApi } from '../api'
import { errorMessage, fieldErrors } from '../api/client'
import Button from '../components/ui/Button'
import { EmptyState } from '../components/ui/Feedback'
import { Input, Textarea } from '../components/ui/Field'
import ProductImage from '../components/ui/ProductImage'
import { useCart } from '../context/CartContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { DELIVERY_FEE, ORDER_TYPES, PAYMENT_METHODS } from '../utils/constants'
import { formatCOP } from '../utils/format'

/** Mismo cálculo que el backend (Coupon::discountFor); el servidor siempre tiene la última palabra. */
const discountFor = (coupon, subtotal) =>
  !coupon ? 0 : Math.min(subtotal, coupon.type === 'porcentaje' ? Math.round((subtotal * coupon.value) / 100) : coupon.value)

function OptionCard({ selected, onClick, icon: Icon, title, hint }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left transition ${
        selected ? 'border-brand-500 bg-brand-50/60' : 'border-line bg-white hover:border-slate-300'
      }`}
    >
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${selected ? 'bg-brand-500 text-white' : 'bg-slate-100 text-ink'}`}>
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="block font-bold">{title}</span>
        {hint && <span className="block text-sm text-muted">{hint}</span>}
      </span>
      {selected && <Check className="absolute top-3 right-3 h-4 w-4 text-brand-600" />}
    </button>
  )
}

export default function Checkout() {
  useDocumentTitle('Finalizar pedido')
  const { items, subtotal, clear } = useCart()
  const navigate = useNavigate()
  const [form, setForm] = useState({ type: 'mesa', table_number: '', address: '', payment_method: 'efectivo', notes: '' })
  const [errors, setErrors] = useState({})
  const [couponInput, setCouponInput] = useState('')
  const [coupon, setCoupon] = useState(null)
  const [checkingCoupon, setCheckingCoupon] = useState(false)
  const [placing, setPlacing] = useState(false)

  if (items.length === 0) {
    return (
      <div className="container-app py-16">
        <EmptyState icon={ShoppingBag} title="Tu carrito está vacío" description="Agrega platos del menú para hacer tu pedido." action="Ir al menú" actionTo="/menu" />
      </div>
    )
  }

  const discount = discountFor(coupon, subtotal)
  const fee = form.type === 'domicilio' ? DELIVERY_FEE : 0
  const total = subtotal - discount + fee
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const applyCoupon = async () => {
    if (!couponInput.trim()) return
    setCheckingCoupon(true)
    setErrors((e) => ({ ...e, coupon_code: undefined }))
    try {
      const res = await orderApi.validateCoupon(couponInput.trim(), subtotal)
      setCoupon(res.data)
      toast.success(`Cupón ${res.data.code} aplicado`)
    } catch (error) {
      setCoupon(null)
      setErrors((e) => ({ ...e, coupon_code: fieldErrors(error).code ?? fieldErrors(error).coupon_code ?? errorMessage(error) }))
    } finally {
      setCheckingCoupon(false)
    }
  }

  const placeOrder = async () => {
    setPlacing(true)
    setErrors({})
    try {
      const res = await orderApi.create({
        ...form,
        table_number: form.type === 'mesa' ? form.table_number : null,
        address: form.type === 'domicilio' ? form.address : null,
        coupon_code: coupon?.code ?? null,
        items: items.map((i) => ({ product_id: i.id, quantity: i.quantity, notes: i.notes || null })),
      })
      clear()
      toast.success(res.message)
      navigate(`/pedidos/${res.data.code}`, { replace: true, state: { justPlaced: true } })
    } catch (error) {
      const fields = fieldErrors(error)
      setErrors(fields)
      toast.error(errorMessage(error, 'No pudimos crear tu pedido.'))
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="container-app py-10">
      <Link to="/menu" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Seguir comprando
      </Link>
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Finalizar pedido</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="text-lg font-bold">1. ¿Cómo quieres recibirlo?</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {ORDER_TYPES.map((t) => (
                <OptionCard key={t.value} selected={form.type === t.value} onClick={() => set('type', t.value)} icon={t.icon} title={t.label} hint={t.hint} />
              ))}
            </div>
            <div className="mt-5">
              {form.type === 'mesa' && (
                <Input label="Número de mesa" type="number" min={1} max={30} placeholder="Ej.: 7" className="max-w-xs" value={form.table_number} error={errors.table_number} onChange={(e) => set('table_number', e.target.value)} />
              )}
              {form.type === 'domicilio' && (
                <Input label="Dirección de entrega" placeholder="Calle 10 # 5-20, apto 301" value={form.address} error={errors.address} onChange={(e) => set('address', e.target.value)} />
              )}
              {form.type === 'recoger' && <p className="rounded-xl bg-slate-50 p-4 text-sm text-muted">Te avisaremos en el seguimiento cuando tu pedido esté listo en el mostrador.</p>}
            </div>
          </section>

          <section className="card p-6">
            <h2 className="text-lg font-bold">2. Método de pago</h2>
            <p className="mt-1 text-sm text-muted">Pagas al recibir tu pedido.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {PAYMENT_METHODS.map((m) => (
                <OptionCard key={m.value} selected={form.payment_method === m.value} onClick={() => set('payment_method', m.value)} icon={m.icon} title={m.label} />
              ))}
            </div>
          </section>

          <section className="card p-6">
            <h2 className="text-lg font-bold">3. Notas generales (opcional)</h2>
            <Textarea className="mt-4" placeholder="Ej.: traer cubiertos extra, timbre dañado…" maxLength={500} value={form.notes} error={errors.notes} onChange={(e) => set('notes', e.target.value)} />
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <h2 className="text-lg font-bold">Resumen</h2>
            <ul className="mt-4 max-h-72 divide-y divide-line overflow-y-auto">
              {items.map((i) => (
                <li key={i.id} className="flex items-center gap-3 py-3">
                  <ProductImage src={i.image_url} alt={i.name} className="h-12 w-12 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{i.quantity} × {i.name}</p>
                    {i.notes && <p className="truncate text-xs text-muted">{i.notes}</p>}
                  </div>
                  <span className="text-sm font-bold">{formatCOP(i.price * i.quantity)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 border-t border-line pt-4">
              {coupon ? (
                <div className="flex items-center justify-between rounded-xl bg-brand-50 px-4 py-3 text-brand-700">
                  <span className="flex items-center gap-2 text-sm font-bold"><BadgePercent className="h-4 w-4" /> {coupon.code}</span>
                  <button onClick={() => { setCoupon(null); setCouponInput('') }} className="rounded p-1 hover:bg-brand-100" aria-label="Quitar cupón">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex gap-2">
                    <input
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
                      placeholder="Cupón de descuento"
                      className={`field h-11 uppercase ${errors.coupon_code ? 'field-error' : ''}`}
                      aria-label="Cupón de descuento"
                    />
                    <Button variant="secondary" onClick={applyCoupon} loading={checkingCoupon}>Aplicar</Button>
                  </div>
                  {errors.coupon_code && <p className="mt-1.5 text-sm font-medium text-red-600">{errors.coupon_code}</p>}
                </div>
              )}
            </div>

            <dl className="mt-5 space-y-2.5 text-[15px]">
              <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="font-semibold">{formatCOP(subtotal)}</dd></div>
              {discount > 0 && <div className="flex justify-between text-brand-600"><dt>Descuento</dt><dd className="font-semibold">− {formatCOP(discount)}</dd></div>}
              {fee > 0 && <div className="flex justify-between"><dt className="text-muted">Envío</dt><dd className="font-semibold">{formatCOP(fee)}</dd></div>}
              <div className="flex justify-between border-t border-line pt-3 text-lg"><dt className="font-bold">Total</dt><dd className="font-extrabold">{formatCOP(total)}</dd></div>
            </dl>

            <Button size="lg" className="mt-6 w-full" onClick={placeOrder} loading={placing}>
              Confirmar pedido · {formatCOP(total)}
            </Button>
          </div>
        </aside>
      </div>
    </div>
  )
}
