import { Pencil, Plus, Ticket, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { adminApi } from '../../api'
import { errorMessage, fieldErrors } from '../../api/client'
import Button from '../../components/ui/Button'
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/Feedback'
import { Input, Select, Toggle } from '../../components/ui/Field'
import Modal from '../../components/ui/Modal'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { formatCOP } from '../../utils/format'

const isExpired = (c) => c.expires_at && c.expires_at < new Date().toISOString().slice(0, 10)

function CouponForm({ coupon, onClose, onSaved }) {
  const [values, setValues] = useState({
    code: coupon?.code ?? '',
    type: coupon?.type ?? 'porcentaje',
    value: coupon?.value ?? 10,
    min_subtotal: coupon?.min_subtotal ?? 0,
    expires_at: coupon?.expires_at ?? '',
    is_active: coupon?.is_active ?? true,
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setValues((s) => ({ ...s, [k]: v }))

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...values, expires_at: values.expires_at || null }
      const res = coupon ? await adminApi.updateCoupon(coupon.id, payload) : await adminApi.createCoupon(payload)
      toast.success(res.message)
      onSaved()
    } catch (error) {
      setErrors(fieldErrors(error))
      toast.error(errorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={coupon ? 'Editar cupón' : 'Nuevo cupón'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" form="coupon-form" loading={saving}>Guardar</Button>
        </>
      }
    >
      <form id="coupon-form" onSubmit={save} className="space-y-5">
        <Input label="Código" placeholder="SENA10" className="uppercase" value={values.code} error={errors.code} onChange={(e) => set('code', e.target.value.toUpperCase())} />
        <div className="grid grid-cols-2 gap-4">
          <Select label="Tipo" value={values.type} onChange={(e) => set('type', e.target.value)}>
            <option value="porcentaje">Porcentaje (%)</option>
            <option value="fijo">Valor fijo ($)</option>
          </Select>
          <Input label={values.type === 'porcentaje' ? 'Descuento (%)' : 'Descuento ($)'} type="number" min={1} value={values.value} error={errors.value} onChange={(e) => set('value', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Pedido mínimo ($)" type="number" min={0} step={1000} value={values.min_subtotal} error={errors.min_subtotal} onChange={(e) => set('min_subtotal', e.target.value)} />
          <Input label="Vence (opcional)" type="date" value={values.expires_at} error={errors.expires_at} onChange={(e) => set('expires_at', e.target.value)} />
        </div>
        <Toggle checked={values.is_active} onChange={(v) => set('is_active', v)} label="Activo" />
      </form>
    </Modal>
  )
}

export default function Coupons() {
  useDocumentTitle('Cupones')
  const [coupons, setCoupons] = useState(null)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null)

  const load = useCallback(() => {
    adminApi.coupons().then((res) => setCoupons(res.data)).catch((e) => setError(errorMessage(e)))
  }, [])

  useEffect(load, [load])

  const remove = async (c) => {
    if (!window.confirm(`¿Eliminar el cupón ${c.code}?`)) return
    try {
      const res = await adminApi.deleteCoupon(c.id)
      toast.success(res.message)
      load()
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }

  if (error) return <ErrorState message={error} onRetry={load} />

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Cupones</h1>
          <p className="mt-1 text-muted">Descuentos que los clientes aplican en el checkout.</p>
        </div>
        <Button onClick={() => setEditing({})}><Plus className="h-4 w-4" /> Nuevo cupón</Button>
      </header>

      {coupons === null ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-36" />)}</div>
      ) : coupons.length === 0 ? (
        <EmptyState icon={Ticket} title="No hay cupones" description="Crea uno para tu próxima promoción." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {coupons.map((c) => {
            const expired = isExpired(c)
            const live = c.is_active && !expired
            return (
              <div key={c.id} className="card relative overflow-hidden p-5">
                <div className={`absolute inset-y-0 left-0 w-1.5 ${live ? 'bg-brand-500' : 'bg-slate-300'}`} />
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-xl font-extrabold tracking-wider">{c.code}</p>
                    <p className="mt-1 text-2xl font-extrabold text-brand-600">{c.type === 'porcentaje' ? `${c.value} %` : formatCOP(c.value)}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${live ? 'bg-brand-50 text-brand-700' : 'bg-slate-100 text-slate-600'}`}>
                    {expired ? 'Vencido' : c.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted">
                  {c.min_subtotal > 0 ? `Desde ${formatCOP(c.min_subtotal)}` : 'Sin mínimo'}
                  {c.expires_at && ` · vence ${c.expires_at}`} · usado {c.used_count} {c.used_count === 1 ? 'vez' : 'veces'}
                </p>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setEditing(c)}><Pencil className="h-3.5 w-3.5" /> Editar</Button>
                  <Button size="sm" variant="danger" onClick={() => remove(c)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {editing && (
        <CouponForm
          coupon={editing.id ? editing : null}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            load()
          }}
        />
      )}
    </div>
  )
}
