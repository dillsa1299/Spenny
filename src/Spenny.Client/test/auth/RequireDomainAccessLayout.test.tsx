import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { fetchSession } from '@/api/authApi'
import { AuthProvider } from '@/auth/AuthContext'
import { RequireDomainAccessLayout } from '@/auth/RequireDomainAccessLayout'
import { guestSession, unverifiedSession, verifiedSession } from '@/test/sessionFixtures'
import { beforeEach, describe, expect, it, vi } from 'vitest'

function ProtectedHome() {
  return <h1>Protected</h1>
}

function SignInProbe() {
  return <h1>Sign in</h1>
}

function renderGuard(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>
        <Routes>
          <Route path="/sign-in" element={<SignInProbe />} />
          <Route element={<RequireDomainAccessLayout />}>
            <Route path="/dashboard" element={<ProtectedHome />} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('RequireDomainAccessLayout', () => {
  beforeEach(() => {
    vi.mocked(fetchSession).mockResolvedValue(guestSession)
  })

  it('redirects signed-out users to sign-in with from state', async () => {
    renderGuard('/dashboard')

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
    })
  })

  it('redirects unverified users to sign-in', async () => {
    vi.mocked(fetchSession).mockResolvedValue(unverifiedSession)
    renderGuard('/dashboard')

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
    })
    expect(screen.queryByRole('heading', { name: 'Protected' })).not.toBeInTheDocument()
  })

  it('renders child routes when domain access is granted', async () => {
    vi.mocked(fetchSession).mockResolvedValue(verifiedSession)
    renderGuard('/dashboard')

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Protected' })).toBeInTheDocument()
    })
  })
})
