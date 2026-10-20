import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { fetchSession, logout } from '@/api/authApi'
import { AuthProvider } from '@/auth/AuthContext'
import { AuthenticatedShell } from '@/layout/AuthenticatedShell'
import { verifiedSession } from '@/test/sessionFixtures'
import { beforeEach, describe, expect, it, vi } from 'vitest'

function renderShell(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>
        <Routes>
          <Route element={<AuthenticatedShell />}>
            <Route path="/dashboard" element={<h1>Dashboard page</h1>} />
            <Route path="/spending" element={<h1>Spending page</h1>} />
            <Route path="/income" element={<h1>Income page</h1>} />
            <Route path="/profile" element={<h1>Profile page</h1>} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('AuthenticatedShell', () => {
  beforeEach(() => {
    vi.mocked(fetchSession).mockResolvedValue(verifiedSession)
  })

  it('highlights the tab that matches the current URL', async () => {
    renderShell('/spending')

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Spending page' })).toBeInTheDocument()
    })

    const spendingTab = screen.getByRole('button', { name: 'Spending' })
    expect(spendingTab).toHaveClass('Mui-selected')
  })

  it('shows welcome copy for the signed-in user', async () => {
    renderShell('/dashboard')

    await waitFor(() => {
      expect(screen.getByText('Welcome back Verified User')).toBeInTheDocument()
    })
    expect(screen.getByRole('link', { name: 'Spenny' })).toHaveAttribute('href', '/dashboard')
  })

  it('sign out invokes logout', async () => {
    const user = userEvent.setup()
    renderShell('/profile')

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Profile page' })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Sign out' }))

    await waitFor(() => {
      expect(logout).toHaveBeenCalledTimes(1)
    })
  })

  it('navigates when a bottom tab is pressed', async () => {
    const user = userEvent.setup()
    renderShell('/dashboard')

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Dashboard page' })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Income' }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Income page' })).toBeInTheDocument()
    })
  })
})
