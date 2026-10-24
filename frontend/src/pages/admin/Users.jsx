import { Search } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { adminApi } from '../../api'
import { errorMessage } from '../../api/client'
import { ErrorState, Skeleton } from '../../components/ui/Feedback'
import { Input, Select } from '../../components/ui/Field'
import Pagination from '../../components/ui/Pagination'
import { useAuth } from '../../context/AuthContext'
import { useDebounce } from '../../hooks/useDebounce'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { ROLES } from '../../utils/constants'
import { formatDateTime, initials } from '../../utils/format'

const ROLE_TONE = {
  cliente: 'bg-slate-100 text-slate-700',
  cocina: 'bg-sky-50 text-sky-700',
  admin: 'bg-brand-50 text-brand-700',
}

export default function Users() {
  useDocumentTitle('Usuarios')
  const { user: me } = useAuth()
  const [users, setUsers] = useState(null)
  const [meta, setMeta] = useState(null)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [page, setPage] = useState(1)
  const debounced = useDebounce(search)

  const load = useCallback(() => {
    adminApi
      .users({ search: debounced || undefined, role: role || undefined, page })
      .then((res) => {
        setUsers(res.data)
        setMeta(res.meta)
        setError(null)
      })
      .catch((e) => setError(errorMessage(e)))
  }, [debounced, role, page])

  useEffect(load, [load])
  useEffect(() => setPage(1), [debounced, role])

  const changeRole = async (user, newRole) => {
    try {
      const res = await adminApi.updateRole(user.id, newRole)
      toast.success(res.message)
      setUsers((list) => list.map((u) => (u.id === user.id ? res.data : u)))
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Usuarios</h1>
        <p className="mt-1 text-muted">Asigna quién trabaja en cocina y quién administra.</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
        <Input icon={Search} placeholder="Nombre o correo…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={role} onChange={(e) => setRole(e.target.value)} aria-label="Rol">
          <option value="">Todos los roles</option>
          {Object.entries(ROLES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </Select>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-bold tracking-wide text-muted uppercase">
                <tr>
                  <th className="px-6 py-3">Usuario</th>
                  <th className="px-3 py-3">Teléfono</th>
                  <th className="px-3 py-3 text-center">Pedidos</th>
                  <th className="px-3 py-3">Registro</th>
                  <th className="px-6 py-3">Rol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {users === null
                  ? Array.from({ length: 6 }, (_, i) => <tr key={i}><td colSpan={5} className="px-6 py-3"><Skeleton className="h-9" /></td></tr>)
                  : users.map((u) => (
                      <tr key={u.id}>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <span className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold ${ROLE_TONE[u.role]}`}>{initials(u.name)}</span>
                            <div>
                              <p className="font-semibold">{u.name} {u.id === me.id && <span className="text-xs font-normal text-muted">(tú)</span>}</p>
                              <p className="text-xs text-muted">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-muted">{u.phone ?? '—'}</td>
                        <td className="px-3 py-3 text-center tabular-nums">{u.orders_count}</td>
                        <td className="px-3 py-3 text-muted">{formatDateTime(u.created_at)}</td>
                        <td className="px-6 py-3">
                          <select
                            value={u.role}
                            disabled={u.id === me.id}
                            onChange={(e) => changeRole(u, e.target.value)}
                            className={`rounded-lg border-0 px-2.5 py-1.5 text-xs font-bold ring-1 ring-line ring-inset disabled:opacity-60 ${ROLE_TONE[u.role]}`}
                            aria-label={`Rol de ${u.name}`}
                          >
                            {Object.entries(ROLES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
          <Pagination meta={meta} onPage={setPage} />
        </div>
      )}
    </div>
  )
}
