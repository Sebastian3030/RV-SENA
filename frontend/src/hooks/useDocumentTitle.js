import { useEffect } from 'react'

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · RV SENA` : 'RV SENA · Pedidos'
  }, [title])
}
