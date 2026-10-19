import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fetchSession, logout } from '@/api/authApi'
import { AuthProvider, useAuth } from '@/auth/AuthContext'
import { verifiedSession, verifiedUser } from '@/test/sessionFixtures'
import { beforeEach, describe, expect, it, vi } from 'vitest'

function AuthProbe() {
  const { loading, user, domainAccess, refresh, signOut, setAuthenticatedUser } = useAuth()
  if (loading) {
    return <p>Loading</p>
  }
  return (
    <div>
      <p>{user ? `User: ${user.displayName}` : 'Signed out'}</p>
      <p>{domainAccess ? 'Has domain access' : 'No domain access'}</p>
      <button type="button" onClick={() => refresh()}>Refresh</button>
      <button type="button" onClick={() => signOut()}>Sign out</button>
      <button type="button" onClick={() => setAuthenticatedUser(verifiedUser)}>Set user</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(fetchSession).mockResolvedValue({ authenticated: false })
    vi.mocked(logout).mockResolvedValue(undefined)
  })

  it('loads session on mount and clears loading', async () => {
    vi.mocked(fetchSession).mockResolvedValue(verifiedSession)
    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    )

    expect(screen.getByText('Loading')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('User: Verified User')).toBeInTheDocument()
    })
    expect(fetchSession).toHaveBeenCalled()
  })

  it('refresh replaces session from fetchSession', async () => {
    vi.mocked(fetchSession)
      .mockResolvedValueOnce({ authenticated: false })
      .mockResolvedValueOnce(verifiedSession)

    const user = userEvent.setup()
    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('Signed out')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Refresh' }))

    await waitFor(() => {
      expect(screen.getByText('User: Verified User')).toBeInTheDocument()
    })
    expect(screen.getByText('Has domain access')).toBeInTheDocument()
  })

  it('signOut clears session when logout API fails', async () => {
    vi.mocked(fetchSession).mockResolvedValue(verifiedSession)
    vi.mocked(logout).mockRejectedValue(new Error('Unauthorized'))
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('User: Verified User')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Sign out' }))

    await waitFor(() => {
      expect(screen.getByText('Signed out')).toBeInTheDocument()
    })
  })

  it('signOut calls logout API and clears session', async () => {
    vi.mocked(fetchSession).mockResolvedValue(verifiedSession)
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('User: Verified User')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Sign out' }))

    await waitFor(() => {
      expect(screen.getByText('Signed out')).toBeInTheDocument()
    })
    expect(logout).toHaveBeenCalledTimes(1)
  })
})
