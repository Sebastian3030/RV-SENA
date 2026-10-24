import { Armchair, Bell, BellOff, Bike, ChefHat, CircleX, Clock, PackageCheck, Sparkles, Store } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { kitchenApi } from '../../api'
import { errorMessage } from '../../api/client'
import Button from '../../components/ui/Button'
import { ErrorState, Skeleton } from '../../components/ui/Feedback'
import { usePolling } from '../../hooks/usePolling'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { formatTime, minutesSince } from '../../utils/format'

const COLUMNS = [
  { status: 'pendiente', title: 'Nuevos', accent: 'bg-amber-500', next: 'en_preparacion', action: 'Empezar', icon: ChefHat },
  { status: 'en_preparacion', title: 'En preparación', accent: 'bg-sky-500', next: 'listo', action: 'Marcar listo', icon: Sparkles },
  { status: 'listo', title: 'Listos para entregar', accent: 'bg-brand-500', next: 'entregado', action: 'Entregado', icon: PackageCheck },
]

const TYPE_ICON = { mesa: Armchair, recoger: Store, domicilio: Bike }

/** Pitido corto con la Web Audio API (gratis, sin archivos de sonido). */
function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    ;[0, 0.18].forEach((delay) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.frequency.value = 880
      gain.gain.setValueAtTime(0.15, ctx.currentTime + delay)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.15)
      osc.connect(gain).connect(ctx.destination)
      osc.start(ctx.currentTime + delay)
      osc.stop(ctx.currentTime + delay + 0.15)
    })
  } catch {
    // El navegador puede bloquear el audio hasta que el usuario interactúe.
  }
}

function OrderCard({ order, column, onMove, busy, isNew }) {
  const minutes = minutesSince(order.created_at)
  const late = minutes >= 20
  const TypeIcon = TYPE_ICON[order.type]

  return (
    <article className={`card p-4 transition ${isNew ? 'animate-fade-in ring-2 ring-amber-400' : ''}`}>
      <header className="flex items-start justify-between gap-2">
        <div>
          <p className="text-lg font-extrabold">{order.code}</p>
          <p className="text-sm text-muted">{order.customer?.name}</p>
        </div>
        <span className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold ${late ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
          <Clock className="h-3.5 w-3.5" /> {minutes} min
        </span>
      </header>

      <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold">
        <TypeIcon className="h-4 w-4 text-muted" />
        {order.type === 'mesa' ? `Mesa ${order.table_number}` : order.type_label}
        <span className="font-normal text-muted">· {formatTime(order.created_at)}</span>
      </p>

      <ul className="mt-3 space-y-1.5 border-t border-dashed border-line pt-3">
        {order.items.map((item) => (
          <li key={item.id} className="text-[15px]">
            <span className="font-extrabold text-brand-600">{item.quantity}×</span> {item.product_name}
            {item.notes && <p className="ml-6 text-sm font-medium text-accent-600">→ {item.notes}</p>}
          </li>
        ))}
      </ul>
      {order.notes && <p className="mt-3 rounded-lg bg-amber-50 p-2 text-sm text-amber-800">“{order.notes}”</p>}

      <div className="mt-4 flex gap-2">
        <Button size="sm" className="flex-1" onClick={() => onMove(order, column.next)} loading={busy}>
          <column.icon className="h-4 w-4" /> {column.action}
        </Button>
        {order.status !== 'listo' && (
          <Button size="sm" variant="danger" onClick={() => onMove(order, 'cancelado')} disabled={busy} aria-label="Cancelar pedido">
            <CircleX className="h-4 w-4" />
          </Button>
        )}
      </div>
    </article>
  )
}

export default function KitchenBoard() {
  useDocumentTitle('Cocina')
  const [orders, setOrders] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(null)
  const [sound, setSound] = useState(true)
  const [newIds, setNewIds] = useState([])
  const known = useRef(null)
  const [, setTick] = useState(0) // refresca los minutos transcurridos

  const load = useCallback(() => {
    kitchenApi
      .orders()
      .then((res) => {
        const ids = res.data.map((o) => o.id)
        if (known.current) {
          const fresh = res.data.filter((o) => !known.current.includes(o.id) && o.status === 'pendiente')
          if (fresh.length) {
            setNewIds(fresh.map((o) => o.id))
            toast.info(fresh.length === 1 ? `Nuevo pedido ${fresh[0].code}` : `${fresh.length} pedidos nuevos`)
            if (sound) beep()
          }
        }
        known.current = ids
        setOrders(res.data)
        setError(null)
        setTick((t) => t + 1)
      })
      .catch((e) => setError(errorMessage(e)))
  }, [sound])

  useEffect(load, [])
  usePolling(load, 5000)

  const move = async (order, status) => {
    if (status === 'cancelado' && !window.confirm(`¿Cancelar el pedido ${order.code}?`)) return
    setBusy(order.id)
    try {
      const res = await kitchenApi.updateStatus(order.code, status)
      toast.success(res.message)
      load()
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      setBusy(null)
    }
  }

  if (error && !orders) return <ErrorState message={error} onRetry={load} />

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Tablero de cocina</h1>
          <p className="mt-1 flex items-center gap-2 text-muted">
            <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500" /> Se actualiza cada 5 segundos · {orders?.length ?? 0} pedidos activos
          </p>
        </div>
        <Button variant="secondary" onClick={() => setSound((s) => !s)}>
          {sound ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />} Sonido {sound ? 'activado' : 'apagado'}
        </Button>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {COLUMNS.map((column) => {
          const list = orders?.filter((o) => o.status === column.status) ?? []
          return (
            <section key={column.status} className="rounded-3xl bg-slate-100/70 p-4">
              <h2 className="mb-4 flex items-center justify-between px-1">
                <span className="flex items-center gap-2 font-bold">
                  <span className={`h-2.5 w-2.5 rounded-full ${column.accent}`} /> {column.title}
                </span>
                <span className="rounded-full bg-white px-2.5 py-0.5 text-sm font-bold">{list.length}</span>
              </h2>
              <div className="space-y-4">
                {orders === null ? (
                  <Skeleton className="h-48" />
                ) : list.length === 0 ? (
                  <p className="rounded-2xl border-2 border-dashed border-slate-200 py-10 text-center text-sm text-muted">Sin pedidos</p>
                ) : (
                  list.map((o) => (
                    <OrderCard key={o.id} order={o} column={column} onMove={move} busy={busy === o.id} isNew={newIds.includes(o.id)} />
                  ))
                )}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
