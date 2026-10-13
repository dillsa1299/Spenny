// Layout guard: unauthenticated or unverified users cannot reach authenticated shell routes.
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'

export function RequireDomainAccessLayout() {
  const { loading, session, domainAccess } = useAuth()
  const location = useLocation()

  if (loading) {
    return null
  }

  if (!session.authenticated) {
    return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />
  }

  if (!domainAccess) {
    return <Navigate to="/sign-in" replace state={{ reason: 'verify_email' }} />
  }

  return <Outlet />
}
