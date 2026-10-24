import { ImagePlus, Package, Pencil, Plus, Search, Star, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { adminApi } from '../../api'
import { errorMessage, fieldErrors } from '../../api/client'
import Button from '../../components/ui/Button'
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/Feedback'
import { Input, Select, Textarea, Toggle } from '../../components/ui/Field'
import Modal from '../../components/ui/Modal'
import Pagination from '../../components/ui/Pagination'
import ProductImage from '../../components/ui/ProductImage'
import { useDebounce } from '../../hooks/useDebounce'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { formatCOP } from '../../utils/format'

const EMPTY = {
  category_id: '',
  name: '',
  description: '',
  price: '',
  prep_minutes: 15,
  badge: '',
  image_url: '',
  is_available: true,
  is_featured: false,
}

function ProductForm({ product, categories, onClose, onSaved }) {
  const [values, setValues] = useState(() =>
    product
      ? {
          category_id: product.category_id,
          name: product.name,
          description: product.description,
          price: product.price,
          prep_minutes: product.prep_minutes,
          badge: product.badge ?? '',
          image_url: '',
          is_available: product.is_available,
          is_featured: product.is_featured,
        }
      : { ...EMPTY, category_id: categories[0]?.id ?? '' },
  )
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(product?.image_url ?? null)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const set = (key, value) => setValues((v) => ({ ...v, [key]: value }))

  const pickFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    const payload = { ...values, image: file ?? undefined }
    if (!payload.image_url) delete payload.image_url
    try {
      const res = product ? await adminApi.updateProduct(product.id, payload) : await adminApi.createProduct(payload)
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
      size="max-w-2xl"
      title={product ? 'Editar producto' : 'Nuevo producto'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" form="product-form" loading={saving}>{product ? 'Guardar cambios' : 'Crear producto'}</Button>
        </>
      }
    >
      <form id="product-form" onSubmit={save} className="grid gap-5 sm:grid-cols-[180px_1fr]">
        <div>
          <span className="label">Imagen</span>
          <label className="group relative flex aspect-square cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-line bg-slate-50 text-center text-sm text-muted hover:border-brand-400">
            {preview ? (
              <ProductImage src={preview} alt="Vista previa" className="absolute inset-0 h-full w-full" />
            ) : (
              <>
                <ImagePlus className="mb-2 h-8 w-8" /> Subir foto
              </>
            )}
            {preview && <span className="absolute inset-x-0 bottom-0 bg-ink/60 py-1.5 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100">Cambiar</span>}
            <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={pickFile} />
          </label>
          {errors.image && <p className="mt-1.5 text-sm font-medium text-red-600">{errors.image}</p>}
          <Input
            className="mt-3"
            placeholder="…o pega una URL"
            value={values.image_url}
            error={errors.image_url}
            onChange={(e) => {
              set('image_url', e.target.value)
              setFile(null)
              if (e.target.value) setPreview(e.target.value)
            }}
          />
        </div>

        <div className="space-y-4">
          <Input label="Nombre" value={values.name} error={errors.name} onChange={(e) => set('name', e.target.value)} />
          <Textarea label="Descripción" value={values.description} error={errors.description} onChange={(e) => set('description', e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Precio (COP)" type="number" min={500} step={100} value={values.price} error={errors.price} onChange={(e) => set('price', e.target.value)} />
            <Input label="Preparación (min)" type="number" min={1} max={120} value={values.prep_minutes} error={errors.prep_minutes} onChange={(e) => set('prep_minutes', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Categoría" value={values.category_id} error={errors.category_id} onChange={(e) => set('category_id', e.target.value)}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Input label="Etiqueta" placeholder="Popular, Nuevo…" maxLength={30} value={values.badge} error={errors.badge} onChange={(e) => set('badge', e.target.value)} />
          </div>
          <div className="space-y-4 rounded-2xl bg-slate-50 p-4">
            <Toggle checked={values.is_available} onChange={(v) => set('is_available', v)} label="Disponible" description="Si lo apagas, desaparece del menú sin borrarse." />
            <Toggle checked={values.is_featured} onChange={(v) => set('is_featured', v)} label="Destacado" description="Aparece en la página de inicio." />
          </div>
        </div>
      </form>
    </Modal>
  )
}

export default function Products() {
  useDocumentTitle('Productos')
  const [products, setProducts] = useState(null)
  const [meta, setMeta] = useState(null)
  const [categories, setCategories] = useState([])
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState(null) // null = cerrado, {} = nuevo, producto = editar
  const debounced = useDebounce(search)

  const load = useCallback(() => {
    adminApi
      .products({ search: debounced || undefined, category_id: categoryId || undefined, page })
      .then((res) => {
        setProducts(res.data)
        setMeta(res.meta)
        setError(null)
      })
      .catch((e) => setError(errorMessage(e)))
  }, [debounced, categoryId, page])

  useEffect(load, [load])
  useEffect(() => setPage(1), [debounced, categoryId])
  useEffect(() => {
    adminApi.categories().then((res) => setCategories(res.data))
  }, [])

  const quickToggle = async (product, key) => {
    try {
      await adminApi.updateProduct(product.id, {
        category_id: product.category_id,
        name: product.name,
        description: product.description,
        price: product.price,
        prep_minutes: product.prep_minutes,
        badge: product.badge ?? '',
        is_available: key === 'is_available' ? !product.is_available : product.is_available,
        is_featured: key === 'is_featured' ? !product.is_featured : product.is_featured,
      })
      load()
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }

  const remove = async (product) => {
    if (!window.confirm(`¿Eliminar "${product.name}"? Los pedidos antiguos conservan su nombre y precio.`)) return
    try {
      const res = await adminApi.deleteProduct(product.id)
      toast.success(res.message)
      load()
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Productos</h1>
          <p className="mt-1 text-muted">{meta?.total ?? '…'} productos en el menú</p>
        </div>
        <Button onClick={() => setEditing({})} disabled={!categories.length}><Plus className="h-4 w-4" /> Nuevo producto</Button>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input icon={Search} placeholder="Buscar producto…" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
        <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="sm:w-56">
          <option value="">Todas las categorías</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
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
                  <th className="px-6 py-3">Producto</th>
                  <th className="px-3 py-3">Categoría</th>
                  <th className="px-3 py-3 text-right">Precio</th>
                  <th className="px-3 py-3 text-center">Vendidos</th>
                  <th className="px-3 py-3 text-center">Disponible</th>
                  <th className="px-3 py-3 text-center">Destacado</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {products === null
                  ? Array.from({ length: 5 }, (_, i) => (
                      <tr key={i}><td colSpan={7} className="px-6 py-3"><Skeleton className="h-10" /></td></tr>
                    ))
                  : products.map((p) => (
                      <tr key={p.id} className={p.is_available ? '' : 'bg-slate-50/60 text-muted'}>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <ProductImage src={p.image_url} alt={p.name} className="h-11 w-11 rounded-xl" />
                            <div>
                              <p className="font-semibold text-ink">{p.name}</p>
                              {p.rating_count > 0 && (
                                <p className="flex items-center gap-1 text-xs text-muted"><Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {p.rating_avg.toFixed(1)} ({p.rating_count})</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">{p.category?.name}</td>
                        <td className="px-3 py-3 text-right font-semibold">{formatCOP(p.price)}</td>
                        <td className="px-3 py-3 text-center tabular-nums">{p.sold_count}</td>
                        <td className="px-3 py-3"><div className="flex justify-center"><Toggle checked={p.is_available} onChange={() => quickToggle(p, 'is_available')} /></div></td>
                        <td className="px-3 py-3"><div className="flex justify-center"><Toggle checked={p.is_featured} onChange={() => quickToggle(p, 'is_featured')} /></div></td>
                        <td className="px-6 py-3">
                          <div className="flex justify-end gap-1">
                            <button onClick={() => setEditing(p)} className="rounded-lg p-2 text-muted hover:bg-slate-100 hover:text-ink" aria-label={`Editar ${p.name}`}><Pencil className="h-4 w-4" /></button>
                            <button onClick={() => remove(p)} className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600" aria-label={`Eliminar ${p.name}`}><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
          {products?.length === 0 && <EmptyState icon={Package} title="Sin resultados" description="No hay productos con ese filtro." />}
          <Pagination meta={meta} onPage={setPage} />
        </div>
      )}

      {editing && (
        <ProductForm
          product={editing.id ? editing : null}
          categories={categories}
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
