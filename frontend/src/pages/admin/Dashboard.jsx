import { Clock, DollarSign, Flame, Receipt, ShoppingBag, Users } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { adminApi } from '../../api'
import { errorMessage } from '../../api/client'
import { StatusBadge } from '../../components/ui/Badge'
import { ErrorState, Skeleton } from '../../components/ui/Feedback'
import { usePolling } from '../../hooks/usePolling'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { formatCOP, formatWeekday, timeAgo } from '../../utils/format'

// brand-600: el verde de marca más oscuro, con contraste suficiente sobre blanco para marcas de datos.
const BAR = '#2E8A00'
const AXIS = '#64748b'
const GRID = '#eef0f2'

const compactCOP = (v) =>
  v >= 1000000 ? `$${(v / 1000000).toFixed(1).replace('.', ',')} M` : v >= 1000 ? `$${Math.round(v / 1000)} mil` : `$${v}`

function StatTile({ icon: Icon, label, value, hint }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-muted">
        <Icon className="h-4 w-4" /> {label}
      </div>
      <p className="mt-3 text-[28px] leading-none font-extrabold tracking-tight">{value}</p>
      {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
    </div>
  )
}

function SalesTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-xl border border-line bg-white px-3 py-2 text-sm shadow-lg">
      <p className="font-bold capitalize">{formatWeekday(d.date)} · {d.date.slice(8)}/{d.date.slice(5, 7)}</p>
      <p className="text-ink">{formatCOP(d.total)}</p>
      <p className="text-muted">{d.orders} pedidos</p>
    </div>
  )
}

export default function Dashboard() {
  useDocumentTitle('Panel')
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  const load = useCallback(() => {
    adminApi
      .dashboard()
      .then((res) => {
        setData(res.data)
        setError(null)
      })
      .catch((e) => setError(errorMessage(e)))
  }, [])

  useEffect(load, [load])
  usePolling(load, 15000)

  if (error && !data) return <ErrorState message={error} onRetry={load} />

  const weekTotal = data?.sales_by_day.reduce((s, d) => s + d.total, 0) ?? 0
  const maxTop = Math.max(1, ...(data?.top_products.map((p) => p.quantity) ?? [1]))

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Panel de administración</h1>
        <p className="mt-1 text-muted">Resumen de hoy · se actualiza cada 15 segundos</p>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {data ? (
          <>
            <StatTile icon={DollarSign} label="Ventas de hoy" value={formatCOP(data.today.sales)} hint="Sin pedidos cancelados" />
            <StatTile icon={ShoppingBag} label="Pedidos de hoy" value={data.today.orders} />
            <StatTile icon={Receipt} label="Ticket promedio" value={formatCOP(data.today.average_ticket)} />
            <StatTile icon={Clock} label="Pedidos activos" value={data.today.active_orders} hint="Pendientes, en preparación o listos" />
            <StatTile icon={Users} label="Clientes" value={data.customers} hint="Cuentas registradas" />
          </>
        ) : (
          Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-[120px]" />)
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="card p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-bold">Ventas de los últimos 7 días</h2>
            <p className="text-sm text-muted">Total: <span className="font-bold text-ink">{formatCOP(weekTotal)}</span></p>
          </div>
          <div className="mt-6 h-72">
            {data ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.sales_by_day} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke={GRID} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => formatWeekday(d)}
                    tick={{ fill: AXIS, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis tickFormatter={compactCOP} tick={{ fill: AXIS, fontSize: 12 }} axisLine={false} tickLine={false} width={84} />
                  <Tooltip content={<SalesTooltip />} cursor={{ fill: '#f1f5f9' }} />
                  <Bar dataKey="total" name="Ventas" fill={BAR} radius={[4, 4, 0, 0]} maxBarSize={36} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Skeleton className="h-full" />
            )}
          </div>
        </section>

        <section className="card p-6">
          <h2 className="flex items-center gap-2 font-bold"><Flame className="h-4 w-4 text-accent-500" /> Platos más vendidos</h2>
          {data ? (
            data.top_products.length === 0 ? (
              <p className="mt-6 text-sm text-muted">Aún no hay ventas.</p>
            ) : (
              <ol className="mt-5 space-y-4">
                {data.top_products.map((p, i) => (
                  <li key={p.name}>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="truncate font-semibold"><span className="mr-2 text-muted">{i + 1}.</span>{p.name}</span>
                      <span className="shrink-0 font-bold tabular-nums">{p.quantity} uds</span>
                    </div>
                    <div className="mt-1.5 h-2 rounded-full bg-slate-100" title={`${p.quantity} unidades · ${formatCOP(p.revenue)}`}>
                      <div className="h-2 rounded-full" style={{ width: `${(p.quantity / maxTop) * 100}%`, background: BAR }} />
                    </div>
                    <p className="mt-1 text-xs text-muted">{formatCOP(p.revenue)} en ventas</p>
                  </li>
                ))}
              </ol>
            )
          ) : (
            <Skeleton className="mt-5 h-60" />
          )}
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.6fr]">
        <section className="card p-6">
          <h2 className="font-bold">Pedidos de hoy por estado</h2>
          <ul className="mt-4 divide-y divide-line">
            {data?.orders_by_status.map((s) => (
              <li key={s.status} className="flex items-center justify-between py-3">
                <StatusBadge status={s.status} label={s.label} />
                <span className="text-lg font-extrabold tabular-nums">{s.total}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card overflow-hidden">
          <div className="flex items-center justify-between p-6 pb-4">
            <h2 className="font-bold">Últimos pedidos</h2>
            <Link to="/admin/pedidos" className="text-sm font-semibold text-brand-600 hover:text-brand-700">Ver todos</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-bold tracking-wide text-muted uppercase">
                <tr>
                  <th className="px-6 py-3">Pedido</th>
                  <th className="px-3 py-3">Cliente</th>
                  <th className="px-3 py-3">Estado</th>
                  <th className="px-6 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data?.recent_orders.map((o) => (
                  <tr key={o.id}>
                    <td className="px-6 py-3">
                      <p className="font-bold">{o.code}</p>
                      <p className="text-xs text-muted">{timeAgo(o.created_at)}</p>
                    </td>
                    <td className="px-3 py-3">{o.customer?.name}</td>
                    <td className="px-3 py-3"><StatusBadge status={o.status} label={o.status_label} /></td>
                    <td className="px-6 py-3 text-right font-bold">{formatCOP(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
