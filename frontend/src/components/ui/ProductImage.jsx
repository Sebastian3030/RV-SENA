import { UtensilsCrossed } from 'lucide-react'
import { useState } from 'react'

/** Imagen del plato con respaldo si la URL falla o no existe. */
export default function ProductImage({ src, alt, className = '' }) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-accent-50 ${className}`}>
        <UtensilsCrossed className="h-1/4 max-h-12 w-1/4 max-w-12 text-brand-500/60" />
      </div>
    )
  }

  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`object-cover ${className}`} />
}
