import { Lock, Mail, Phone, User } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { authApi } from '../api'
import { errorMessage, fieldErrors } from '../api/client'
import Button from '../components/ui/Button'
import { Input } from '../components/ui/Field'
import { useAuth } from '../context/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { initials } from '../utils/format'

export default function Profile() {
  useDocumentTitle('Mi perfil')
  const { user, setUser } = useAuth()
  const [form, setForm] = useState({ name: user.name, phone: user.phone ?? '' })
  const [pwd, setPwd] = useState({ current_password: '', password: '', password_confirmation: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(null)

  const save = async (which) => {
    setSaving(which)
    setErrors({})
    try {
      const payload = which === 'password' ? { ...form, ...pwd } : form
      const res = await authApi.updateProfile(payload)
      setUser(res.data)
      if (which === 'password') setPwd({ current_password: '', password: '', password_confirmation: '' })
      toast.success(which === 'password' ? 'Contraseña actualizada' : 'Perfil actualizado')
    } catch (error) {
      setErrors(fieldErrors(error))
      toast.error(errorMessage(error))
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="container-app max-w-3xl py-10">
      <div className="flex items-center gap-5">
        <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-500 text-2xl font-extrabold text-white shadow-lg shadow-brand-500/30">
          {initials(user.name)}
        </span>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{user.name}</h1>
          <p className="text-muted">{user.role_label} · {user.email}</p>
        </div>
      </div>

      <form className="card mt-8 space-y-5 p-6" onSubmit={(e) => { e.preventDefault(); save('profile') }}>
        <h2 className="text-lg font-bold">Datos personales</h2>
        <Input label="Nombre" icon={User} value={form.name} error={errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Correo" icon={Mail} value={user.email} disabled hint="El correo no se puede cambiar." />
          <Input label="Teléfono" icon={Phone} value={form.phone} error={errors.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div className="flex justify-end">
          <Button type="submit" loading={saving === 'profile'}>Guardar cambios</Button>
        </div>
      </form>

      <form className="card mt-6 space-y-5 p-6" onSubmit={(e) => { e.preventDefault(); save('password') }}>
        <h2 className="text-lg font-bold">Cambiar contraseña</h2>
        <Input label="Contraseña actual" type="password" icon={Lock} autoComplete="current-password" value={pwd.current_password} error={errors.current_password} onChange={(e) => setPwd({ ...pwd, current_password: e.target.value })} />
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Nueva contraseña" type="password" icon={Lock} autoComplete="new-password" value={pwd.password} error={errors.password} onChange={(e) => setPwd({ ...pwd, password: e.target.value })} />
          <Input label="Confirmar nueva contraseña" type="password" icon={Lock} autoComplete="new-password" value={pwd.password_confirmation} onChange={(e) => setPwd({ ...pwd, password_confirmation: e.target.value })} />
        </div>
        <div className="flex justify-end">
          <Button type="submit" variant="dark" loading={saving === 'password'} disabled={!pwd.password}>Actualizar contraseña</Button>
        </div>
      </form>
    </div>
  )
}
