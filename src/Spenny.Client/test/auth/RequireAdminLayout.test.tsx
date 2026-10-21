import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { fetchSession } from '@/api/authApi'
import { AuthProvider } from '@/auth/AuthContext'
import { RequireAdminLayout } from '@/auth/RequireAdminLayout'
import { adminSession, verifiedSession } from '@/test/sessionFixtures'
import { describe, expect, it, vi } from 'vitest'

function renderAdminGuard(session: typeof verifiedSession) {
  vi.mocked(fetchSession).mockResolvedValue(session)
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <AuthProvider>
        <Routes>
          <Route element={<RequireAdminLayout />}>
            <Route path="/admin" element={<h1>Admin area</h1>} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('RequireAdminLayout', () => {
  it('blocks non-admin users with not found', async () => {
    renderAdminGuard(verifiedSession)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
    })
  })

  it('renders child routes for admins', async () => {
    renderAdminGuard(adminSession)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Admin area' })).toBeInTheDocument()
    })
  })
})
