import { Lock, Mail, Phone, User } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { errorMessage, fieldErrors } from '../api/client'
import AuthShell from '../components/layout/AuthShell'
import Button from '../components/ui/Button'
import { Input } from '../components/ui/Field'
import { useAuth } from '../context/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

function passwordStrength(value) {
  let score = 0
  if (value.length >= 8) score++
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++
  if (/\d/.test(value)) score++
  if (/[^A-Za-z0-9]/.test(value)) score++
  return score
}

const STRENGTH = [
  { label: 'Muy corta', color: 'bg-red-400' },
  { label: 'Débil', color: 'bg-red-400' },
  { label: 'Aceptable', color: 'bg-amber-400' },
  { label: 'Buena', color: 'bg-brand-400' },
  { label: 'Excelente', color: 'bg-brand-500' },
]

export default function Register() {
  useDocumentTitle('Crear cuenta')
  const { register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', password_confirmation: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })
  const strength = passwordStrength(form.password)
  const mismatch = form.password_confirmation && form.password !== form.password_confirmation

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    try {
      const user = await register(form)
      toast.success(`¡Bienvenido, ${user.name.split(' ')[0]}!`, { description: 'Usa el cupón SENA10 en tu primer pedido.' })
      navigate(location.state?.from ?? '/menu', { replace: true })
    } catch (error) {
      setErrors(fieldErrors(error))
      if (error.response?.status !== 422) toast.error(errorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Crea tu cuenta" subtitle="Es gratis y te toma menos de un minuto.">
      <form onSubmit={submit} className="space-y-5" noValidate>
        <Input label="Nombre completo" icon={User} autoComplete="name" placeholder="Ana Gómez" value={form.name} error={errors.name} onChange={set('name')} />
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Correo" type="email" icon={Mail} autoComplete="email" placeholder="tu@correo.com" value={form.email} error={errors.email} onChange={set('email')} />
          <Input label="Teléfono (opcional)" type="tel" icon={Phone} autoComplete="tel" placeholder="300 123 4567" value={form.phone} error={errors.phone} onChange={set('phone')} />
        </div>
        <div>
          <Input label="Contraseña" type="password" icon={Lock} autoComplete="new-password" placeholder="Mínimo 8 caracteres" value={form.password} error={errors.password} onChange={set('password')} />
          {form.password && (
            <div className="mt-2 flex items-center gap-3">
              <div className="flex flex-1 gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className={`h-1.5 flex-1 rounded-full ${i < strength ? STRENGTH[strength].color : 'bg-slate-200'}`} />
                ))}
              </div>
              <span className="text-xs font-semibold text-muted">{STRENGTH[strength].label}</span>
            </div>
          )}
        </div>
        <Input
          label="Confirma la contraseña"
          type="password"
          icon={Lock}
          autoComplete="new-password"
          value={form.password_confirmation}
          error={mismatch ? 'Las contraseñas no coinciden.' : undefined}
          onChange={set('password_confirmation')}
        />
        <Button type="submit" size="lg" className="w-full" loading={loading} disabled={Boolean(mismatch)}>Crear cuenta</Button>
      </form>
      <p className="mt-6 text-center text-muted">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" state={location.state} className="font-semibold text-brand-600 hover:text-brand-700">Inicia sesión</Link>
      </p>
    </AuthShell>
  )
}
