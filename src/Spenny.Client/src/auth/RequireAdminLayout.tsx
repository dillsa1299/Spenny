// Hides admin routes from non-operators without redirecting to sign-in.
import { Outlet } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { NotFoundPage } from '@/pages/NotFoundPage'

export function RequireAdminLayout() {
  const { loading, user } = useAuth()

  if (loading) {
    return null
  }

  if (!user?.isAdmin) {
    return <NotFoundPage />
  }

  return <Outlet />
}
