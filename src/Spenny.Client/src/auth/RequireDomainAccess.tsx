// Redirects unauthenticated or unverified users away from the app shell.
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'

type RequireDomainAccessProps = {
  children: React.ReactNode
}

export function RequireDomainAccess({ children }: RequireDomainAccessProps) {
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

  return children
}
