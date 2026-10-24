import { Heart } from 'lucide-react'
import { useEffect, useState } from 'react'
import { favoriteApi } from '../api'
import { errorMessage } from '../api/client'
import ProductCard, { ProductCardSkeleton } from '../components/menu/ProductCard'
import { EmptyState, ErrorState } from '../components/ui/Feedback'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function Favorites() {
  useDocumentTitle('Favoritos')
  const [products, setProducts] = useState(null)
  const [error, setError] = useState(null)

  const load = () => {
    setError(null)
    favoriteApi.list().then((res) => setProducts(res.data)).catch((e) => setError(errorMessage(e)))
  }

  useEffect(load, [])

  return (
    <div className="container-app py-10">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Tus favoritos</h1>
      <p className="mt-2 text-muted">Los platos que más te gustan, a un clic de distancia.</p>

      <div className="mt-8">
        {error ? (
          <ErrorState message={error} onRetry={load} />
        ) : products === null ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <EmptyState icon={Heart} title="Aún no tienes favoritos" description="Toca el corazón de cualquier plato para guardarlo aquí." action="Explorar el menú" actionTo="/menu" />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onFavoriteChange={(isFav) => !isFav && setProducts((list) => list.filter((x) => x.id !== p.id))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
