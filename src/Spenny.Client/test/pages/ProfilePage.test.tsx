import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { fetchSession } from '@/api/authApi'
import { AppProviders } from '@/providers/AppProviders'
import { ProfilePage } from '@/pages/ProfilePage'
import { verifiedSession } from '@/test/sessionFixtures'
import { describe, expect, it, vi } from 'vitest'

describe('ProfilePage', () => {
  it('shows sign out for a signed-in user', async () => {
    vi.mocked(fetchSession).mockResolvedValue(verifiedSession)
    render(
      <MemoryRouter>
        <AppProviders>
          <ProfilePage />
        </AppProviders>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument()
    })
  })
})
