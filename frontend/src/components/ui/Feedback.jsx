import { LoaderCircle } from 'lucide-react'
import Button from './Button'

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-xl bg-slate-200/70 ${className}`} />
}

export function PageLoader({ label = 'Cargando…' }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-muted">
      <LoaderCircle className="h-8 w-8 animate-spin text-brand-500" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, action, actionTo, onAction }) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      {Icon && (
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <Icon className="h-8 w-8" />
        </div>
      )}
      <h3 className="text-lg font-bold">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-muted">{description}</p>}
      {action && (
        <Button className="mt-6" to={actionTo} onClick={onAction}>
          {action}
        </Button>
      )}
    </div>
  )
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="card mx-auto max-w-md p-8 text-center">
      <p className="font-semibold">No pudimos cargar esta información</p>
      <p className="mt-1 text-sm text-muted">{message}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-5" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  )
}
