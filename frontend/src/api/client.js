import axios from 'axios'

export const TOKEN_KEY = 'rv-sena-token'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api/v1',
  headers: { Accept: 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token vencido o inválido: se limpia y la app vuelve a modo invitado.
    if (error.response?.status === 401 && localStorage.getItem(TOKEN_KEY)) {
      localStorage.removeItem(TOKEN_KEY)
      window.dispatchEvent(new Event('rv:unauthorized'))
    }
    return Promise.reject(error)
  },
)

/** Mensaje legible para mostrar en un aviso. */
export function errorMessage(error, fallback = 'Algo salió mal. Intenta de nuevo.') {
  if (!error?.response) return 'No hay conexión con el servidor. ¿Está corriendo el backend?'
  const { status, data } = error.response
  if (status === 403) return data?.message || 'No tienes permiso para hacer esto.'
  if (status === 422 && data?.errors) return Object.values(data.errors)[0]?.[0] ?? data.message
  return data?.message || fallback
}

/** Errores de validación por campo: { email: 'mensaje' } */
export function fieldErrors(error) {
  const errors = error?.response?.data?.errors ?? {}
  return Object.fromEntries(Object.entries(errors).map(([key, messages]) => [key, messages[0]]))
}
