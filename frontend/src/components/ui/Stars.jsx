import { Star } from 'lucide-react'
import { useState } from 'react'

export function Stars({ value = 0, size = 'h-4 w-4' }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value.toFixed(1)} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${size} ${n <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`}
        />
      ))}
    </span>
  )
}

export function StarInput({ value, onChange }) {
  const [hover, setHover] = useState(0)
  const labels = ['', 'Malo', 'Regular', 'Bueno', 'Muy bueno', '¡Excelente!']
  const shown = hover || value

  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHover(n)}
            onClick={() => onChange(n)}
            className="transition hover:scale-110"
            aria-label={`${n} estrellas`}
          >
            <Star className={`h-8 w-8 ${n <= shown ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-300'}`} />
          </button>
        ))}
      </div>
      <span className="text-sm font-semibold text-muted">{labels[shown]}</span>
    </div>
  )
}
