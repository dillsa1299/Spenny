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
  /** Clears client session only (e.g. after server already signed out on account delete). */
  clearSession: () => void
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

  const clearSession = useCallback(() => {
    setSession({ authenticated: false })
  }, [])

  const signOut = useCallback(async () => {
    try {
      await apiLogout()
    } catch {
      // Server may already have cleared the cookie (expired session, account deleted).
    }
    clearSession()
  }, [clearSession])

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
      clearSession,
      setAuthenticatedUser,
    }
  }, [loading, session, refresh, signOut, clearSession, setAuthenticatedUser])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
