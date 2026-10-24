import { ChefHat, Lock, Mail, ShieldCheck, User } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { errorMessage, fieldErrors } from '../api/client'
import AuthShell from '../components/layout/AuthShell'
import Button from '../components/ui/Button'
import { Input } from '../components/ui/Field'
import { useAuth } from '../context/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { homeFor } from '../routes/guards'

const DEMO = [
  { label: 'Cliente', email: 'cliente@rvsena.com', icon: User },
  { label: 'Cocina', email: 'cocina@rvsena.com', icon: ChefHat },
  { label: 'Admin', email: 'admin@rvsena.com', icon: ShieldCheck },
]

export default function Login() {
  useDocumentTitle('Iniciar sesión')
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    try {
      const user = await login(form)
      toast.success(`¡Hola, ${user.name.split(' ')[0]}!`)
      const from = location.state?.from
      navigate(from && user.role !== 'cocina' ? from : homeFor(user), { replace: true })
    } catch (error) {
      setErrors(fieldErrors(error))
      if (error.response?.status !== 422) toast.error(errorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Bienvenido de nuevo" subtitle="Ingresa para pedir y seguir tus pedidos en vivo.">
      <form onSubmit={submit} className="space-y-5" noValidate>
        <Input
          label="Correo"
          type="email"
          icon={Mail}
          autoComplete="email"
          placeholder="tu@correo.com"
          value={form.email}
          error={errors.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input
          label="Contraseña"
          type="password"
          icon={Lock}
          autoComplete="current-password"
          placeholder="••••••••"
          value={form.password}
          error={errors.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <Button type="submit" size="lg" className="w-full" loading={loading}>Entrar</Button>
      </form>

      <p className="mt-6 text-center text-muted">
        ¿No tienes cuenta?{' '}
        <Link to="/registro" state={location.state} className="font-semibold text-brand-600 hover:text-brand-700">Regístrate gratis</Link>
      </p>

      <div className="mt-10 rounded-2xl border border-dashed border-line bg-white p-4">
        <p className="text-xs font-bold tracking-wider text-muted uppercase">Cuentas de prueba · contraseña rvsena123</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {DEMO.map(({ label, email, icon: Icon }) => (
            <button
              key={email}
              type="button"
              onClick={() => setForm({ email, password: 'rvsena123' })}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-line px-2 py-3 text-sm font-semibold transition hover:border-brand-200 hover:bg-brand-50"
            >
              <Icon className="h-5 w-5 text-brand-600" /> {label}
            </button>
          ))}
        </div>
      </div>
    </AuthShell>
  )
}
