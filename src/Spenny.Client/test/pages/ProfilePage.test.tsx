import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { fetchSession, updateDisplayName } from '@/api/authApi'
import { AppProviders } from '@/providers/AppProviders'
import { ProfilePage } from '@/pages/ProfilePage'
import { googleSession, verifiedSession, verifiedUser } from '@/test/sessionFixtures'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/api/authApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/authApi')>()
  return {
    ...actual,
    fetchSession: vi.fn(),
    updateDisplayName: vi.fn(),
  }
})

function renderProfile(session = verifiedSession) {
  vi.mocked(fetchSession).mockResolvedValue(session)
  return render(
    <MemoryRouter>
      <AppProviders>
        <ProfilePage />
      </AppProviders>
    </MemoryRouter>,
  )
}

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not show a page-level sign out control', async () => {
    renderProfile()

    await waitFor(() => {
      expect(screen.getByLabelText(/Display name/i)).toBeInTheDocument()
    })
    expect(screen.queryByRole('button', { name: 'Sign out' })).not.toBeInTheDocument()
  })

  it('shows password section for local accounts', async () => {
    renderProfile()

    await waitFor(() => {
      expect(screen.getByLabelText(/Current password/i)).toBeInTheDocument()
    })
  })

  it('hides password section for Google accounts', async () => {
    renderProfile(googleSession)

    await waitFor(() => {
      expect(screen.getByLabelText(/Display name/i)).toBeInTheDocument()
    })
    expect(screen.queryByLabelText(/Current password/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Sign out' })).not.toBeInTheDocument()
  })

  it('saves display name via API and refreshes session', async () => {
    const user = userEvent.setup()
    vi.mocked(updateDisplayName).mockResolvedValue({
      ...verifiedUser,
      displayName: 'New Name',
    })
    renderProfile()

    await waitFor(() => {
      expect(screen.getByLabelText(/Display name/i)).toBeInTheDocument()
    })

    const nameField = screen.getByLabelText(/Display name/i)
    await user.clear(nameField)
    await user.type(nameField, 'New Name')
    await user.click(screen.getByRole('button', { name: 'Save display name' }))

    await waitFor(() => {
      expect(updateDisplayName).toHaveBeenCalledWith('New Name')
    })
  })
})
