import { ClipboardList, Search } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { adminApi } from '../../api'
import { errorMessage } from '../../api/client'
import { StatusBadge } from '../../components/ui/Badge'
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/Feedback'
import { Input, Select } from '../../components/ui/Field'
import Modal from '../../components/ui/Modal'
import Pagination from '../../components/ui/Pagination'
import { useDebounce } from '../../hooks/useDebounce'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { ORDER_STATUS } from '../../utils/constants'
import { formatCOP, formatDateTime, formatTime } from '../../utils/format'

function OrderDetail({ order, onClose }) {
  return (
    <Modal open onClose={onClose} title={`Pedido ${order.code}`} description={`${formatDateTime(order.created_at)} · ${order.customer?.name ?? ''}`}>
      <div className="space-y-5 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={order.status} label={order.status_label} />
          <span className="text-muted">{order.type_label}{order.table_number ? ` · mesa ${order.table_number}` : ''} · {order.payment_label}</span>
        </div>
        {order.address && <p><span className="text-muted">Dirección:</span> {order.address}</p>}
        <ul className="divide-y divide-line rounded-xl border border-line">
          {order.items.map((i) => (
            <li key={i.id} className="flex justify-between gap-3 px-4 py-3">
              <span>
                {i.quantity} × {i.product_name}
                {i.notes && <span className="block text-xs text-muted">{i.notes}</span>}
              </span>
              <span className="font-semibold">{formatCOP(i.subtotal)}</span>
            </li>
          ))}
        </ul>
        <dl className="space-y-1.5">
          <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatCOP(order.subtotal)}</dd></div>
          {order.discount > 0 && <div className="flex justify-between"><dt className="text-muted">Descuento</dt><dd>− {formatCOP(order.discount)}</dd></div>}
          {order.delivery_fee > 0 && <div className="flex justify-between"><dt className="text-muted">Envío</dt><dd>{formatCOP(order.delivery_fee)}</dd></div>}
          <div className="flex justify-between text-base font-extrabold"><dt>Total</dt><dd>{formatCOP(order.total)}</dd></div>
        </dl>
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-4 text-xs sm:grid-cols-4">
          {[['Recibido', order.created_at], ['Aceptado', order.accepted_at], ['Listo', order.ready_at], [order.cancelled_at ? 'Cancelado' : 'Entregado', order.cancelled_at ?? order.delivered_at]].map(([label, at]) => (
            <div key={label}><p className="text-muted">{label}</p><p className="font-bold">{at ? formatTime(at) : '—'}</p></div>
          ))}
        </div>
      </div>
    </Modal>
  )
}

export default function AdminOrders() {
  useDocumentTitle('Pedidos')
  const [orders, setOrders] = useState(null)
  const [meta, setMeta] = useState(null)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({ status: '', date: '', search: '' })
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)
  const search = useDebounce(filters.search)

  const load = useCallback(() => {
    adminApi
      .orders({ status: filters.status || undefined, date: filters.date || undefined, search: search || undefined, page })
      .then((res) => {
        setOrders(res.data)
        setMeta(res.meta)
        setError(null)
      })
      .catch((e) => setError(errorMessage(e)))
  }, [filters.status, filters.date, search, page])

  useEffect(load, [load])
  useEffect(() => setPage(1), [filters.status, filters.date, search])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Pedidos</h1>
        <p className="mt-1 text-muted">Historial completo. Toca un pedido para ver el detalle.</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-[1fr_200px_180px]">
        <Input icon={Search} placeholder="Código o cliente…" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        <Select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} aria-label="Estado">
          <option value="">Todos los estados</option>
          {Object.entries(ORDER_STATUS).map(([value, { label }]) => <option key={value} value={value}>{label}</option>)}
        </Select>
        <input type="date" className="field" value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })} aria-label="Fecha" />
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-bold tracking-wide text-muted uppercase">
                <tr>
                  <th className="px-6 py-3">Pedido</th>
                  <th className="px-3 py-3">Cliente</th>
                  <th className="px-3 py-3">Tipo</th>
                  <th className="px-3 py-3">Estado</th>
                  <th className="px-3 py-3 text-center">Platos</th>
                  <th className="px-6 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {orders === null
                  ? Array.from({ length: 6 }, (_, i) => <tr key={i}><td colSpan={6} className="px-6 py-3"><Skeleton className="h-9" /></td></tr>)
                  : orders.map((o) => (
                      <tr key={o.id} onClick={() => setSelected(o)} className="cursor-pointer hover:bg-slate-50">
                        <td className="px-6 py-3"><p className="font-bold">{o.code}</p><p className="text-xs text-muted">{formatDateTime(o.created_at)}</p></td>
                        <td className="px-3 py-3">{o.customer?.name}</td>
                        <td className="px-3 py-3 text-muted">{o.type_label}</td>
                        <td className="px-3 py-3"><StatusBadge status={o.status} label={o.status_label} /></td>
                        <td className="px-3 py-3 text-center tabular-nums">{o.items_count}</td>
                        <td className="px-6 py-3 text-right font-bold">{formatCOP(o.total)}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
          {orders?.length === 0 && <EmptyState icon={ClipboardList} title="Sin pedidos" description="No hay pedidos con esos filtros." />}
          <Pagination meta={meta} onPage={setPage} />
        </div>
      )}

      {selected && <OrderDetail order={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
