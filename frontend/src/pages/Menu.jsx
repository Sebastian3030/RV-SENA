import { Search, SearchX, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { menuApi } from '../api'
import { errorMessage } from '../api/client'
import CategoryChips from '../components/menu/CategoryChips'
import ProductCard, { ProductCardSkeleton } from '../components/menu/ProductCard'
import { EmptyState, ErrorState } from '../components/ui/Feedback'
import { useDebounce } from '../hooks/useDebounce'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { SORT_OPTIONS } from '../utils/constants'

export default function Menu() {
  useDocumentTitle('Menú')
  const [params, setParams] = useSearchParams()
  const category = params.get('category') ?? ''
  const sort = params.get('sort') ?? 'popular'
  const searchParam = params.get('search') ?? ''
  const [search, setSearch] = useState(searchParam)
  const debouncedSearch = useDebounce(search)

  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState(null)
  const [error, setError] = useState(null)

  const updateParam = useCallback(
    (key, value) => {
      setParams(
        (prev) => {
          if ((prev.get(key) ?? '') === (value ?? '')) return prev
          const next = new URLSearchParams(prev)
          value ? next.set(key, value) : next.delete(key)
          return next
        },
        { replace: true },
      )
    },
    [setParams],
  )

  useEffect(() => {
    menuApi.categories().then((res) => setCategories(res.data)).catch(() => {})
  }, [])

  useEffect(() => {
    updateParam('search', debouncedSearch.trim())
  }, [debouncedSearch, updateParam])

  const load = useCallback(() => {
    setProducts(null)
    setError(null)
    menuApi
      .products({ category: category || undefined, search: searchParam || undefined, sort })
      .then((res) => setProducts(res.data))
      .catch((e) => setError(errorMessage(e)))
  }, [category, sort, searchParam])

  useEffect(load, [load])

  const activeCategory = categories.find((c) => c.slug === category)

  return (
    <div className="container-app py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{activeCategory ? activeCategory.name : 'Nuestro menú'}</h1>
        <p className="mt-2 text-muted">Todo se prepara al momento. Agrega notas a cada plato antes de pedir.</p>
      </header>

      <div className="sticky top-[72px] z-20 -mx-4 mb-8 space-y-4 bg-canvas/90 px-4 py-4 backdrop-blur sm:mx-0 sm:px-0">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o ingrediente…"
              className="field h-12 pl-12"
              aria-label="Buscar platos"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-muted hover:text-ink" aria-label="Limpiar búsqueda">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <select value={sort} onChange={(e) => updateParam('sort', e.target.value === 'popular' ? '' : e.target.value)} className="field h-12 sm:w-56" aria-label="Ordenar">
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <CategoryChips categories={categories} active={category} onChange={(slug) => updateParam('category', slug)} />
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : products === null ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No encontramos platos"
          description="Prueba con otra palabra o revisa todas las categorías."
          action="Ver todo el menú"
          onAction={() => {
            setSearch('')
            setParams({})
          }}
        />
      ) : (
        <>
          <p className="mb-4 text-sm text-muted">{products.length} {products.length === 1 ? 'plato' : 'platos'}</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </>
      )}
    </div>
  )
}
