import { Minus, Plus } from 'lucide-react'

export default function QuantityStepper({ value, onChange, min = 1, max = 20, size = 'md' }) {
  const box = size === 'sm' ? 'h-8 w-8' : 'h-11 w-11'
  const text = size === 'sm' ? 'w-7 text-sm' : 'w-10 text-base'

  return (
    <div className="inline-flex items-center rounded-xl border border-line bg-white p-0.5">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        className={`${box} flex items-center justify-center rounded-[10px] text-ink transition hover:bg-slate-100 disabled:opacity-40`}
        aria-label="Quitar uno"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className={`${text} text-center font-bold tabular-nums`}>{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        className={`${box} flex items-center justify-center rounded-[10px] text-ink transition hover:bg-slate-100 disabled:opacity-40`}
        aria-label="Agregar uno"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}
