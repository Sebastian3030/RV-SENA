import { Check, ChefHat, CircleX, ClipboardList, PackageCheck, Sparkles } from 'lucide-react'
import { formatTime } from '../../utils/format'

const STEPS = [
  { key: 'pendiente', field: 'created_at', title: 'Pedido recibido', text: 'La cocina ya tiene tu pedido.', icon: ClipboardList },
  { key: 'en_preparacion', field: 'accepted_at', title: 'En preparación', text: 'Nuestros cocineros están en ello.', icon: ChefHat },
  { key: 'listo', field: 'ready_at', title: 'Listo', text: 'Tu pedido está listo para salir.', icon: Sparkles },
  { key: 'entregado', field: 'delivered_at', title: 'Entregado', text: '¡Buen provecho!', icon: PackageCheck },
]

const ORDER = STEPS.map((s) => s.key)

export default function OrderTimeline({ order }) {
  if (order.status === 'cancelado') {
    return (
      <div className="flex items-start gap-4 rounded-2xl bg-red-50 p-5 text-red-700">
        <CircleX className="h-6 w-6 shrink-0" />
        <div>
          <p className="font-bold">Pedido cancelado</p>
          <p className="text-sm">Cancelado a las {formatTime(order.cancelled_at)}. No se realizó ningún cobro.</p>
        </div>
      </div>
    )
  }

  const current = ORDER.indexOf(order.status)

  return (
    <ol className="relative">
      {STEPS.map((step, i) => {
        const done = i < current || order.status === 'entregado'
        const active = i === current && order.status !== 'entregado'
        const Icon = step.icon
        return (
          <li key={step.key} className="relative flex gap-4 pb-8 last:pb-0">
            {i < STEPS.length - 1 && (
              <span className={`absolute top-11 left-[21px] h-[calc(100%-44px)] w-0.5 rounded ${i < current ? 'bg-brand-500' : 'bg-line'}`} />
            )}
            <span
              className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition ${
                done ? 'bg-brand-500 text-white' : active ? 'bg-brand-50 text-brand-600 ring-4 ring-brand-500/20' : 'bg-slate-100 text-slate-400'
              }`}
            >
              {done ? <Check className="h-5 w-5" /> : <Icon className={`h-5 w-5 ${active ? 'animate-pulse' : ''}`} />}
            </span>
            <div className="pt-1.5">
              <p className={`font-bold ${done || active ? 'text-ink' : 'text-slate-400'}`}>
                {step.title}
                {order[step.field] && <span className="ml-2 text-sm font-medium text-muted">{formatTime(order[step.field])}</span>}
              </p>
              {(done || active) && <p className="text-sm text-muted">{step.text}</p>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
