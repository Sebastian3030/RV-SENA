import { useEffect, useRef } from 'react'

/**
 * Ejecuta `callback` cada `interval` ms mientras la pestaña esté visible.
 * Es nuestro "tiempo real" gratuito: no requiere WebSockets.
 */
export function usePolling(callback, interval = 5000, enabled = true) {
  const saved = useRef(callback)

  useEffect(() => {
    saved.current = callback
  }, [callback])

  useEffect(() => {
    if (!enabled) return
    const tick = () => {
      if (document.visibilityState === 'visible') saved.current()
    }
    const id = setInterval(tick, interval)
    document.addEventListener('visibilitychange', tick)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [interval, enabled])
}
