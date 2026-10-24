import { Heart } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { favoriteApi } from '../../api'
import { errorMessage } from '../../api/client'
import { useAuth } from '../../context/AuthContext'

export default function FavoriteButton({ product, onChange, className = '' }) {
  const { isAuthenticated, canOrder } = useAuth()
  const [active, setActive] = useState(product.is_favorite)
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  if (isAuthenticated && !canOrder) return null

  const toggle = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      toast('Ingresa para guardar tus favoritos')
      navigate('/login')
      return
    }
    setBusy(true)
    setActive((a) => !a) // respuesta inmediata; se corrige si falla
    try {
      const res = await favoriteApi.toggle(product.id)
      setActive(res.data.is_favorite)
      onChange?.(res.data.is_favorite)
    } catch (error) {
      setActive((a) => !a)
      toast.error(errorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:scale-110 ${className}`}
      aria-label={active ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      aria-pressed={active}
    >
      <Heart className={`h-[18px] w-[18px] transition ${active ? 'animate-pop fill-red-500 text-red-500' : 'text-ink'}`} />
    </button>
  )
}
