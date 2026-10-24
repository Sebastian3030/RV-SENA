import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router'
import Logo from '../ui/Logo'

export default function Footer() {
  return (
    <footer className="mt-20 bg-ink text-slate-300">
      <div className="container-app grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
            Cocina rápida y moderna. Pide desde tu mesa, para recoger o a domicilio, y sigue tu pedido en vivo.
          </p>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-bold tracking-wider text-white uppercase">Explora</h3>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/menu" className="hover:text-white">Menú completo</Link></li>
            <li><Link to="/pedidos" className="hover:text-white">Mis pedidos</Link></li>
            <li><Link to="/favoritos" className="hover:text-white">Favoritos</Link></li>
            <li><Link to="/registro" className="hover:text-white">Crear cuenta</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-bold tracking-wider text-white uppercase">Horario</h3>
          <ul className="space-y-2.5 text-sm">
            <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-brand-400" /> Lun a sáb · 11:00 a 22:00</li>
            <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-brand-400" /> Dom y festivos · 12:00 a 20:00</li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-bold tracking-wider text-white uppercase">Contacto</h3>
          <ul className="space-y-2.5 text-sm">
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-brand-400" /> Centro de formación SENA</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-brand-400" /> 300 123 4567</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-brand-400" /> hola@rvsena.com</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-app flex flex-col items-center justify-between gap-2 py-6 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} RV SENA. Proyecto formativo.</p>
          <p>Hecho con React y Laravel</p>
        </div>
      </div>
    </footer>
  )
}
