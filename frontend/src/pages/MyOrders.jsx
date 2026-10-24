import { ChevronRight, ClipboardList } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { orderApi } from '../api'
import { errorMessage } from '../api/client'
import { StatusBadge } from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { EmptyState, ErrorState, Skeleton } from '../components/ui/Feedback'
import ProductImage from '../components/ui/ProductImage'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { formatCOP, formatDateTime } from '../utils/format'

export default function MyOrders() {
  useDocumentTitle('Mis pedidos')
  const [orders, setOrders] = useState(null)
  const [meta, setMeta] = useState(null)
  const [error, setError] = useState(null)
  const [loadingMore, setLoadingMore] = useState(false)

  const load = useCallback((page = 1) => {
    setError(null)
    return orderApi
      .list(page)
      .then((res) => {
        setOrders((prev) => (page === 1 ? res.data : [...(prev ?? []), ...res.data]))
        setMeta(res.meta)
      })
      .catch((e) => setError(errorMessage(e)))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const loadMore = async () => {
    setLoadingMore(true)
    await load(meta.current_page + 1)
    setLoadingMore(false)
  }

  return (
    <div className="container-app max-w-4xl py-10">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Mis pedidos</h1>
      <p className="mt-2 text-muted">Toca un pedido para ver su seguimiento y calificar lo que recibiste.</p>

      <div className="mt-8">
        {error ? (
          <ErrorState message={error} onRetry={() => load()} />
        ) : orders === null ? (
          <div className="space-y-4">{Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-28" />)}</div>
        ) : orders.length === 0 ? (
          <EmptyState icon={ClipboardList} title="Aún no tienes pedidos" description="Cuando hagas tu primer pedido podrás seguirlo desde aquí." action="Ver el menú" actionTo="/menu" />
        ) : (
          <>
            <ul className="space-y-4">
              {orders.map((o) => (
                <li key={o.id}>
                  <Link to={`/pedidos/${o.code}`} className="card group flex items-center gap-5 p-5 transition hover:border-brand-200 hover:shadow-[var(--shadow-lift)]">
                    <div className="hidden -space-x-3 sm:flex">
                      {o.items.slice(0, 3).map((i) => (
                        <ProductImage key={i.id} src={i.image_url} alt={i.product_name} className="h-14 w-14 rounded-2xl ring-4 ring-white" />
                      ))}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold">{o.code}</span>
                        <StatusBadge status={o.status} label={o.status_label} />
                      </div>
                      <p className="mt-1 truncate text-sm text-muted">{o.items.map((i) => `${i.quantity}× ${i.product_name}`).join(', ')}</p>
                      <p className="mt-1 text-xs text-muted">{formatDateTime(o.created_at)} · {o.type_label}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold">{formatCOP(o.total)}</p>
                      <ChevronRight className="ml-auto mt-1 h-5 w-5 text-muted transition group-hover:translate-x-1 group-hover:text-brand-600" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            {meta && meta.current_page < meta.last_page && (
              <div className="mt-6 text-center">
                <Button variant="secondary" onClick={loadMore} loading={loadingMore}>Ver pedidos anteriores</Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
