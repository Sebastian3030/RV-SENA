import { ORDER_STATUS } from '../../utils/constants'

export function Badge({ children, className = 'bg-accent-500 text-white' }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold tracking-wide ${className}`}>
      {children}
    </span>
  )
}

export function StatusBadge({ status, label }) {
  const config = ORDER_STATUS[status] ?? ORDER_STATUS.pendiente
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${config.tone}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot} ${status === 'pendiente' || status === 'en_preparacion' ? 'animate-pulse' : ''}`} />
      {label ?? config.label}
    </span>
  )
}
