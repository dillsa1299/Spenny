// Marketing and other public routes: signed-in users with app access go to the dashboard.
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'

type GuestOnlyProps = {
  children: React.ReactNode
}

export function GuestOnly({ children }: GuestOnlyProps) {
  const { loading, domainAccess } = useAuth()

  if (loading) {
    return null
  }

  if (domainAccess) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
