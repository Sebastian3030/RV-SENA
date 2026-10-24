import { Navigate, Outlet, useLocation } from 'react-router'
import { PageLoader } from '../components/ui/Feedback'
import { useAuth } from '../context/AuthContext'

/** Exige sesión; con `roles` también exige uno de esos roles. */
export function RequireAuth({ roles }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PageLoader />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />

  return <Outlet />
}

/** Solo para invitados (login y registro). */
export function GuestOnly() {
  const { user, loading } = useAuth()

  if (loading) return <PageLoader />
  if (user) return <Navigate to={homeFor(user)} replace />

  return <Outlet />
}

export function homeFor(user) {
  if (user.role === 'admin') return '/admin'
  if (user.role === 'cocina') return '/cocina'
  return '/menu'
}
