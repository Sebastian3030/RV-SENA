import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { adminApi } from '../../api'
import { errorMessage, fieldErrors } from '../../api/client'
import Button from '../../components/ui/Button'
import { ErrorState, Skeleton } from '../../components/ui/Feedback'
import { Input, Toggle } from '../../components/ui/Field'
import Modal from '../../components/ui/Modal'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { CATEGORY_ICONS, categoryIcon } from '../../utils/constants'

function CategoryForm({ category, onClose, onSaved }) {
  const [values, setValues] = useState({
    name: category?.name ?? '',
    icon: category?.icon ?? 'utensils',
    sort_order: category?.sort_order ?? 0,
    is_active: category?.is_active ?? true,
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = category ? await adminApi.updateCategory(category.id, values) : await adminApi.createCategory(values)
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
      title={category ? 'Editar categoría' : 'Nueva categoría'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" form="category-form" loading={saving}>Guardar</Button>
        </>
      }
    >
      <form id="category-form" onSubmit={save} className="space-y-5">
        <Input label="Nombre" value={values.name} error={errors.name} onChange={(e) => setValues({ ...values, name: e.target.value })} />
        <div>
          <span className="label">Ícono</span>
          <div className="grid grid-cols-7 gap-2">
            {Object.entries(CATEGORY_ICONS).map(([key, Icon]) => (
              <button
                key={key}
                type="button"
                onClick={() => setValues({ ...values, icon: key })}
                className={`flex aspect-square items-center justify-center rounded-xl border-2 transition ${values.icon === key ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-line text-muted hover:border-slate-300'}`}
                aria-label={key}
              >
                <Icon className="h-5 w-5" />
              </button>
            ))}
          </div>
        </div>
        <Input label="Orden en el menú" type="number" min={0} value={values.sort_order} error={errors.sort_order} onChange={(e) => setValues({ ...values, sort_order: e.target.value })} />
        <Toggle checked={values.is_active} onChange={(v) => setValues({ ...values, is_active: v })} label="Activa" description="Las categorías inactivas no aparecen en el menú." />
      </form>
    </Modal>
  )
}

export default function Categories() {
  useDocumentTitle('Categorías')
  const [categories, setCategories] = useState(null)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null)

  const load = useCallback(() => {
    adminApi.categories().then((res) => setCategories(res.data)).catch((e) => setError(errorMessage(e)))
  }, [])

  useEffect(load, [load])

  const remove = async (c) => {
    if (!window.confirm(`¿Eliminar la categoría "${c.name}"?`)) return
    try {
      const res = await adminApi.deleteCategory(c.id)
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
          <h1 className="text-3xl font-extrabold tracking-tight">Categorías</h1>
          <p className="mt-1 text-muted">Organizan el menú. El orden define cómo aparecen.</p>
        </div>
        <Button onClick={() => setEditing({})}><Plus className="h-4 w-4" /> Nueva categoría</Button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {categories === null
          ? Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-24" />)
          : categories.map((c) => {
              const Icon = categoryIcon(c.icon)
              return (
                <div key={c.id} className={`card flex items-center gap-4 p-5 ${c.is_active ? '' : 'opacity-60'}`}>
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><Icon className="h-6 w-6" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{c.name}</p>
                    <p className="text-sm text-muted">{c.products_count} productos · orden {c.sort_order}{!c.is_active && ' · inactiva'}</p>
                  </div>
                  <button onClick={() => setEditing(c)} className="rounded-lg p-2 text-muted hover:bg-slate-100 hover:text-ink" aria-label={`Editar ${c.name}`}><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => remove(c)} className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600" aria-label={`Eliminar ${c.name}`}><Trash2 className="h-4 w-4" /></button>
                </div>
              )
            })}
      </div>

      {editing && (
        <CategoryForm
          category={editing.id ? editing : null}
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
