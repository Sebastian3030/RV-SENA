import { ChefHat, ClipboardList, LayoutDashboard, LogOut, Menu, Package, Store, Tags, Ticket, Users, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../../context/AuthContext'
import { initials } from '../../utils/format'
import Logo from '../ui/Logo'

const adminLinks = [
  { to: '/admin', label: 'Panel', icon: LayoutDashboard, end: true },
  { to: '/cocina', label: 'Tablero de cocina', icon: ChefHat },
  { to: '/admin/pedidos', label: 'Pedidos', icon: ClipboardList },
  { to: '/admin/productos', label: 'Productos', icon: Package },
  { to: '/admin/categorias', label: 'Categorías', icon: Tags },
  { to: '/admin/cupones', label: 'Cupones', icon: Ticket },
  { to: '/admin/usuarios', label: 'Usuarios', icon: Users },
]

const kitchenLinks = [{ to: '/cocina', label: 'Tablero de cocina', icon: ChefHat }]

export default function AdminLayout() {
  const { user, isAdmin, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const links = isAdmin ? adminLinks : kitchenLinks

  useEffect(() => setOpen(false), [pathname])

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-[72px] items-center px-6">
        <Logo to={isAdmin ? '/admin' : '/cocina'} />
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold transition ${
                isActive ? 'bg-brand-50 text-brand-700' : 'text-muted hover:bg-slate-50 hover:text-ink'
              }`
            }
          >
            <Icon className="h-5 w-5" /> {label}
          </NavLink>
        ))}
        <div className="my-3 h-px bg-line" />
        <NavLink to="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold text-muted hover:bg-slate-50 hover:text-ink">
          <Store className="h-5 w-5" /> Ver la tienda
        </NavLink>
      </nav>
      <div className="border-t border-line p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-sm font-bold text-brand-700">{initials(user.name)}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">{user.name}</p>
            <p className="truncate text-xs text-muted">{user.role_label}</p>
          </div>
          <button
            onClick={async () => {
              await logout()
              navigate('/login')
            }}
            className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600"
            aria-label="Cerrar sesión"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-canvas">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-white lg:block">{sidebar}</aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <aside className="animate-fade-in absolute inset-y-0 left-0 w-72 bg-white shadow-2xl">
            <button onClick={() => setOpen(false)} className="absolute top-5 right-4 rounded-lg p-1.5 text-muted" aria-label="Cerrar menú">
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white/85 px-4 backdrop-blur lg:hidden">
          <button onClick={() => setOpen(true)} className="rounded-lg p-2" aria-label="Abrir menú">
            <Menu className="h-6 w-6" />
          </button>
          <Logo to={isAdmin ? '/admin' : '/cocina'} />
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
