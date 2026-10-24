import { ChefHat, ClipboardList, Heart, LayoutDashboard, LogOut, Menu, ShoppingBag, User, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { initials } from '../../utils/format'
import Button from '../ui/Button'
import Logo from '../ui/Logo'

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-[15px] font-semibold transition ${isActive ? 'text-brand-600' : 'text-muted hover:text-ink'}`

function CartButton() {
  const { count, open, bump } = useCart()
  return (
    <button
      onClick={open}
      className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-white transition hover:border-slate-300"
      aria-label={`Abrir carrito, ${count} productos`}
    >
      <ShoppingBag className="h-5 w-5" />
      {count > 0 && (
        <span key={bump} className="animate-pop absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 px-1 text-[11px] font-bold text-white">
          {count}
        </span>
      )}
    </button>
  )
}

function UserMenu() {
  const { user, logout, isAdmin, isStaff, canOrder } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false)
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const item = 'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-slate-50'

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 rounded-xl p-1 pr-2 transition hover:bg-slate-100">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-sm font-bold text-brand-700">
          {initials(user.name)}
        </span>
        <span className="hidden text-sm font-semibold lg:block">{user.name.split(' ')[0]}</span>
      </button>
      {open && (
        <div className="animate-fade-in absolute right-0 z-40 mt-2 w-60 rounded-2xl border border-line bg-white p-2 shadow-[var(--shadow-lift)]" onClick={() => setOpen(false)}>
          <div className="px-3 py-2">
            <p className="truncate text-sm font-bold">{user.name}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
          <div className="my-1 h-px bg-line" />
          {canOrder && (
            <>
              <Link to="/pedidos" className={item}><ClipboardList className="h-4 w-4 text-muted" /> Mis pedidos</Link>
              <Link to="/favoritos" className={item}><Heart className="h-4 w-4 text-muted" /> Favoritos</Link>
            </>
          )}
          {isStaff && <Link to="/cocina" className={item}><ChefHat className="h-4 w-4 text-muted" /> Tablero de cocina</Link>}
          {isAdmin && <Link to="/admin" className={item}><LayoutDashboard className="h-4 w-4 text-muted" /> Panel de administración</Link>}
          <Link to="/perfil" className={item}><User className="h-4 w-4 text-muted" /> Mi perfil</Link>
          <div className="my-1 h-px bg-line" />
          <button
            className={`${item} w-full text-red-600`}
            onClick={async () => {
              await logout()
              navigate('/')
            }}
          >
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const { isAuthenticated, canOrder, isStaff } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const showCart = !isAuthenticated || canOrder

  useEffect(() => setMobileOpen(false), [location.pathname])

  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-white/85 backdrop-blur-lg">
      <div className="container-app flex h-[72px] items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink to="/" end className={linkClass}>Inicio</NavLink>
            <NavLink to="/menu" className={linkClass}>Menú</NavLink>
            {canOrder && <NavLink to="/pedidos" className={linkClass}>Mis pedidos</NavLink>}
            {isStaff && <NavLink to="/cocina" className={linkClass}>Cocina</NavLink>}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {showCart && <CartButton />}
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button variant="ghost" to="/login">Ingresar</Button>
              <Button to="/registro">Crear cuenta</Button>
            </div>
          )}
          <button className="flex h-11 w-11 items-center justify-center rounded-xl md:hidden" onClick={() => setMobileOpen((o) => !o)} aria-label="Menú">
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="animate-fade-in border-t border-line bg-white px-4 pt-2 pb-4 md:hidden">
          <NavLink to="/" end className={(s) => `block ${linkClass(s)}`}>Inicio</NavLink>
          <NavLink to="/menu" className={(s) => `block ${linkClass(s)}`}>Menú</NavLink>
          {canOrder && <NavLink to="/pedidos" className={(s) => `block ${linkClass(s)}`}>Mis pedidos</NavLink>}
          {isStaff && <NavLink to="/cocina" className={(s) => `block ${linkClass(s)}`}>Cocina</NavLink>}
          {!isAuthenticated && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button variant="secondary" to="/login">Ingresar</Button>
              <Button to="/registro">Crear cuenta</Button>
            </div>
          )}
        </nav>
      )}
    </header>
  )
}
