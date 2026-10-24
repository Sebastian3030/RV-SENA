import { ArrowRight, BadgePercent, Bike, ChefHat, Clock, Search, ShieldCheck, Smartphone, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { menuApi } from '../api'
import ProductCard, { ProductCardSkeleton } from '../components/menu/ProductCard'
import Button from '../components/ui/Button'
import ProductImage from '../components/ui/ProductImage'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { categoryIcon } from '../utils/constants'
import { formatCOP } from '../utils/format'

const STEPS = [
  { icon: Smartphone, title: 'Elige y personaliza', text: 'Explora el menú, agrega notas como “sin cebolla” y arma tu pedido en segundos.' },
  { icon: ChefHat, title: 'La cocina lo recibe al instante', text: 'Tu pedido aparece en el tablero de cocina sin papeles ni comandas perdidas.' },
  { icon: Bike, title: 'Síguelo en vivo', text: 'Mira cuándo está en preparación, cuándo está listo y cuándo va en camino.' },
]

export default function Home() {
  useDocumentTitle('Inicio')
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [categories, setCategories] = useState([])
  const [featured, setFeatured] = useState(null)

  useEffect(() => {
    menuApi.categories().then((res) => setCategories(res.data)).catch(() => {})
    menuApi.products({ featured: 1 }).then((res) => setFeatured(res.data)).catch(() => setFeatured([]))
  }, [])

  // El plato estrella del banner: preferimos una hamburguesa destacada, si no el primero.
  const hero = featured?.find((p) => p.category?.slug === 'hamburguesas') ?? featured?.[0]
  const totalProducts = categories.reduce((sum, c) => sum + (c.products_count ?? 0), 0)

  const onSearch = (e) => {
    e.preventDefault()
    navigate(search.trim() ? `/menu?search=${encodeURIComponent(search.trim())}` : '/menu')
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 -right-40 h-[520px] w-[520px] rounded-full bg-brand-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-20 h-[420px] w-[420px] rounded-full bg-accent-100/60 blur-3xl" />

        <div className="container-app relative grid items-center gap-12 py-14 lg:grid-cols-2 lg:py-24">
          <div className="animate-fade-in">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-brand-700 shadow-sm ring-1 ring-brand-100">
              <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500" /> Cocina abierta · pedidos en vivo
            </span>
            <h1 className="mt-6 text-4xl leading-[1.08] font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              ¿Qué se te <span className="relative whitespace-nowrap text-brand-500">antoja<svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none"><path d="M2 9c40-6 120-8 196-3" stroke="#FF7A00" strokeWidth="4" strokeLinecap="round" /></svg></span> hoy?
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
              Pide desde tu mesa, para recoger o a domicilio. La cocina recibe tu pedido al instante y tú lo sigues paso a paso.
            </p>

            <form onSubmit={onSearch} className="mt-8 flex max-w-lg items-center gap-2 rounded-2xl border border-line bg-white p-2 shadow-[var(--shadow-soft)] focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/15">
              <Search className="ml-3 h-5 w-5 shrink-0 text-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Hamburguesas, pizza, ramen…"
                className="min-w-0 flex-1 bg-transparent px-1 py-2 text-[15px] outline-none placeholder:text-muted/70"
                aria-label="Buscar en el menú"
              />
              <Button type="submit">Buscar</Button>
            </form>

            <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
              <div>
                <dt className="text-sm text-muted">Platos en el menú</dt>
                <dd className="text-2xl font-extrabold">{totalProducts || '—'}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted">Tiempo promedio</dt>
                <dd className="flex items-center gap-1.5 text-2xl font-extrabold"><Clock className="h-5 w-5 text-brand-500" /> 25 min</dd>
              </div>
              <div>
                <dt className="text-sm text-muted">Pago</dt>
                <dd className="text-2xl font-extrabold">Al recibir</dd>
              </div>
            </dl>
          </div>

          {/* Collage del plato estrella */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative aspect-square overflow-hidden rounded-[40px] bg-white shadow-[var(--shadow-lift)] rotate-2">
              <ProductImage src={hero?.image_url} alt={hero?.name ?? 'Plato destacado'} className="h-full w-full" />
            </div>
            {hero && (
              <Link to={`/menu/${hero.slug}`} className="animate-fade-in absolute -bottom-6 -left-4 flex max-w-[260px] items-center gap-3 rounded-2xl bg-white p-3 pr-5 shadow-[var(--shadow-lift)] transition hover:-translate-y-1 sm:-left-8">
                <ProductImage src={hero.image_url} alt="" className="h-14 w-14 rounded-xl" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{hero.name}</p>
                  <p className="text-sm font-extrabold text-brand-600">{formatCOP(hero.price)}</p>
                </div>
              </Link>
            )}
            <div className="absolute -top-4 -right-2 flex items-center gap-2 rounded-2xl bg-ink px-4 py-3 text-white shadow-xl sm:-right-6">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              <div className="leading-tight">
                <p className="text-sm font-bold">Clientes felices</p>
                <p className="text-xs text-slate-300">Califican lo que reciben</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="container-app py-10">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Explora por categoría</h2>
          <Link to="/menu" className="hidden items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 sm:flex">
            Ver todo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {categories.map((c) => {
            const Icon = categoryIcon(c.icon)
            return (
              <Link
                key={c.id}
                to={`/menu?category=${c.slug}`}
                className="group card flex flex-col items-center gap-3 px-3 py-5 text-center transition hover:-translate-y-1 hover:border-brand-200"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-500 group-hover:text-white">
                  <Icon className="h-7 w-7" />
                </span>
                <span>
                  <span className="block text-sm font-bold">{c.name}</span>
                  <span className="text-xs text-muted">{c.products_count} platos</span>
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Destacados */}
      <section className="container-app py-10">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Los favoritos de la casa</h2>
          <p className="mt-1 text-muted">Seleccionados por nuestro chef. Agrégalos con un clic.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured === null
            ? Array.from({ length: 3 }, (_, i) => <ProductCardSkeleton key={i} />)
            : featured.slice(0, 6).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="container-app py-14">
        <h2 className="text-center text-2xl font-extrabold tracking-tight sm:text-3xl">Así de fácil funciona</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <div key={title} className="card relative p-7">
              <span className="absolute top-6 right-6 text-5xl font-extrabold text-slate-100">0{i + 1}</span>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-lg shadow-brand-500/30">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-lg font-bold">{title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cupón */}
      <section className="container-app py-6">
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-brand-600 to-brand-900 px-8 py-12 text-white sm:px-14">
          <div className="pointer-events-none absolute -top-20 -right-10 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold">
                <BadgePercent className="h-4 w-4" /> Para tu primer pedido
              </span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">10 % de descuento con el cupón <span className="rounded-lg bg-white px-2 text-brand-700">SENA10</span></h2>
              <p className="mt-3 flex items-center gap-2 text-brand-100"><ShieldCheck className="h-4 w-4" /> En pedidos desde $ 20.000. Pagas al recibir.</p>
            </div>
            <Button variant="accent" size="lg" to="/menu">Pedir ahora <ArrowRight className="h-5 w-5" /></Button>
          </div>
        </div>
      </section>
    </>
  )
}
