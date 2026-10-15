import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { fetchSession } from '@/api/authApi'
import { AppProviders } from '@/providers/AppProviders'
import { DashboardPage } from '@/pages/DashboardPage'
import { SelectedMonthProvider } from '@/month/SelectedMonthContext'
import { verifiedSession } from '@/test/sessionFixtures'
import { describe, expect, it, vi } from 'vitest'

describe('DashboardPage', () => {
  it('shows dashboard title and month selector', async () => {
    vi.mocked(fetchSession).mockResolvedValue(verifiedSession)
    render(
      <MemoryRouter>
        <AppProviders>
          <SelectedMonthProvider>
            <DashboardPage />
          </SelectedMonthProvider>
        </AppProviders>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: 'Previous month' })).toBeInTheDocument()
  })
})
