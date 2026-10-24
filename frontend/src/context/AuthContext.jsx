import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authApi } from '../api'
import { TOKEN_KEY } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)))

  // Al cargar la app, si hay token se recupera el usuario.
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return
    authApi
      .me()
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const onUnauthorized = () => setUser(null)
    window.addEventListener('rv:unauthorized', onUnauthorized)
    return () => window.removeEventListener('rv:unauthorized', onUnauthorized)
  }, [])

  const startSession = useCallback(({ data }) => {
    localStorage.setItem(TOKEN_KEY, data.token)
    setUser(data.user)
    return data.user
  }, [])

  const login = useCallback((credentials) => authApi.login(credentials).then(startSession), [startSession])
  const register = useCallback((payload) => authApi.register(payload).then(startSession), [startSession])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // Si el token ya no sirve igual cerramos la sesión local.
    }
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin',
      isStaff: user?.role === 'admin' || user?.role === 'cocina',
      canOrder: user?.role === 'cliente' || user?.role === 'admin',
      login,
      register,
      logout,
      setUser,
    }),
    [user, loading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
