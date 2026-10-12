// Client session state from GET /api/auth/session; refreshed after sign-in and sign-out.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { fetchSession, logout as apiLogout, type SessionState, type SessionUser } from '@/api/authApi'

type AuthContextValue = {
  loading: boolean
  session: SessionState
  user: SessionUser | null
  domainAccess: boolean
  refresh: () => Promise<void>
  signOut: () => Promise<void>
  setAuthenticatedUser: (user: SessionUser) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<SessionState>({ authenticated: false })

  const refresh = useCallback(async () => {
    const next = await fetchSession()
    setSession(next)
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const next = await fetchSession()
        if (!cancelled) {
          setSession(next)
        }
      } catch {
        if (!cancelled) {
          setSession({ authenticated: false })
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const signOut = useCallback(async () => {
    await apiLogout()
    setSession({ authenticated: false })
  }, [])

  const setAuthenticatedUser = useCallback((user: SessionUser) => {
    setSession({ authenticated: true, user, domainAccess: user.emailConfirmed })
  }, [])

  const value = useMemo<AuthContextValue>(() => {
    const user = session.authenticated ? session.user : null
    const domainAccess = session.authenticated ? session.domainAccess : false
    return {
      loading,
      session,
      user,
      domainAccess,
      refresh,
      signOut,
      setAuthenticatedUser,
    }
  }, [loading, session, refresh, signOut, setAuthenticatedUser])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
