import { UtensilsCrossed } from 'lucide-react'
import { Link } from 'react-router'

export default function Logo({ to = '/', light = false }) {
  return (
    <Link to={to} className="flex items-center gap-2.5" aria-label="RV SENA, inicio">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white shadow-md shadow-brand-500/30">
        <UtensilsCrossed className="h-5 w-5" />
      </span>
      <span className={`text-xl font-extrabold tracking-tight ${light ? 'text-white' : 'text-ink'}`}>
        RV <span className="text-brand-500">SENA</span>
      </span>
    </Link>
  )
}
