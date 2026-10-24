import { UtensilsCrossed } from 'lucide-react'
import Button from '../components/ui/Button'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function NotFound() {
  useDocumentTitle('Página no encontrada')
  return (
    <div className="container-app flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <div className="relative">
        <p className="text-[120px] leading-none font-extrabold text-slate-100 sm:text-[180px]">404</p>
        <UtensilsCrossed className="absolute top-1/2 left-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 text-brand-500" />
      </div>
      <h1 className="mt-4 text-2xl font-extrabold">Este plato no está en el menú</h1>
      <p className="mt-2 max-w-md text-muted">La página que buscas no existe o se movió. Volvamos a algo delicioso.</p>
      <div className="mt-8 flex gap-3">
        <Button variant="secondary" to="/">Inicio</Button>
        <Button to="/menu">Ver el menú</Button>
      </div>
    </div>
  )
}
