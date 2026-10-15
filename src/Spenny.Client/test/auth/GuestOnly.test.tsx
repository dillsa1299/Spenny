import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { fetchSession } from '@/api/authApi'
import { AuthProvider } from '@/auth/AuthContext'
import { GuestOnly } from '@/auth/GuestOnly'
import { guestSession, verifiedSession } from '@/test/sessionFixtures'
import { beforeEach, describe, expect, it, vi } from 'vitest'

function renderGuestOnly() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <AuthProvider>
        <Routes>
          <Route
            path="/"
            element={
              <GuestOnly>
                <h1>Marketing</h1>
              </GuestOnly>
            }
          />
          <Route path="/dashboard" element={<h1>Dashboard</h1>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('GuestOnly', () => {
  beforeEach(() => {
    vi.mocked(fetchSession).mockResolvedValue(guestSession)
  })

  it('shows marketing content for guests', async () => {
    renderGuestOnly()

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Marketing' })).toBeInTheDocument()
    })
  })

  it('redirects verified users to the dashboard', async () => {
    vi.mocked(fetchSession).mockResolvedValue(verifiedSession)
    renderGuestOnly()

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    })
  })
})
