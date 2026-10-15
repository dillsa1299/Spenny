import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { fetchSession } from '@/api/authApi'
import { AuthProvider } from '@/auth/AuthContext'
import { RequireDomainAccess } from '@/auth/RequireDomainAccess'
import { guestSession, verifiedSession } from '@/test/sessionFixtures'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('RequireDomainAccess', () => {
  beforeEach(() => {
    vi.mocked(fetchSession).mockResolvedValue(guestSession)
  })

  it('renders children when the user has domain access', async () => {
    vi.mocked(fetchSession).mockResolvedValue(verifiedSession)
    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <Routes>
            <Route
              path="/"
              element={
                <RequireDomainAccess>
                  <h1>Inside app</h1>
                </RequireDomainAccess>
              }
            />
            <Route path="/sign-in" element={<h1>Sign in</h1>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Inside app' })).toBeInTheDocument()
    })
  })

  it('redirects guests to sign-in', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <Routes>
            <Route
              path="/"
              element={
                <RequireDomainAccess>
                  <h1>Inside app</h1>
                </RequireDomainAccess>
              }
            />
            <Route path="/sign-in" element={<h1>Sign in</h1>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
    })
  })
})
