import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ meta, onPage }) {
  if (!meta || meta.last_page <= 1) return null

  return (
    <div className="flex items-center justify-between border-t border-line px-6 py-4 text-sm">
      <p className="text-muted">
        {meta.from}–{meta.to} de {meta.total}
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPage(meta.current_page - 1)}
          disabled={meta.current_page <= 1}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white hover:bg-slate-50 disabled:opacity-40"
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="flex items-center px-2 font-semibold">{meta.current_page} / {meta.last_page}</span>
        <button
          onClick={() => onPage(meta.current_page + 1)}
          disabled={meta.current_page >= meta.last_page}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white hover:bg-slate-50 disabled:opacity-40"
          aria-label="Página siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
