import { LayoutGrid } from 'lucide-react'
import { categoryIcon } from '../../utils/constants'

export default function CategoryChips({ categories, active, onChange }) {
  const chip = (isActive) =>
    `flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
      isActive
        ? 'border-brand-500 bg-brand-500 text-white shadow-md shadow-brand-500/25'
        : 'border-line bg-white text-ink hover:border-brand-200 hover:bg-brand-50'
    }`

  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      <button className={chip(!active)} onClick={() => onChange('')}>
        <LayoutGrid className="h-4 w-4" /> Todo
      </button>
      {categories.map((c) => {
        const Icon = categoryIcon(c.icon)
        return (
          <button key={c.id} className={chip(active === c.slug)} onClick={() => onChange(c.slug)}>
            <Icon className="h-4 w-4" /> {c.name}
            {c.products_count !== undefined && (
              <span className={`text-xs ${active === c.slug ? 'text-white/80' : 'text-muted'}`}>{c.products_count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
