import { Quote } from 'lucide-react'
import Logo from '../ui/Logo'

const PHOTO = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80'

/** Pantalla dividida para login y registro: formulario + foto. */
export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Logo />
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
          <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
          <p className="mt-2 text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>

      <div className="relative hidden overflow-hidden lg:block">
        <img src={PHOTO} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />
        <figure className="absolute right-12 bottom-12 left-12 text-white">
          <Quote className="h-10 w-10 text-brand-400" />
          <blockquote className="mt-4 text-2xl leading-snug font-bold">
            “Pedí desde la mesa y en la pantalla vi cuando mi plato salió de la cocina. Así debería funcionar todo restaurante.”
          </blockquote>
          <figcaption className="mt-4 text-slate-300">Cliente de RV SENA</figcaption>
        </figure>
      </div>
    </div>
  )
}
