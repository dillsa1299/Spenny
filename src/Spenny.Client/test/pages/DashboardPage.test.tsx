import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { fetchSession } from '@/api/authApi'
import { fetchSpendingMonth, listSpendingSeries } from '@/api/spendingApi'
import { AppProviders } from '@/providers/AppProviders'
import { DashboardPage } from '@/pages/DashboardPage'
import { SelectedMonthProvider } from '@/month/SelectedMonthContext'
import { october2026MonthFixture } from '@/test/spendingMonthFixture'
import { verifiedSession } from '@/test/sessionFixtures'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/api/spendingApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/spendingApi')>()
  return {
    ...actual,
    fetchSpendingMonth: vi.fn(),
    listSpendingSeries: vi.fn(),
  }
})

describe('DashboardPage', () => {
  it('shows burndown total and coming up from month API', async () => {
    vi.mocked(fetchSession).mockResolvedValue(verifiedSession)
    vi.mocked(fetchSpendingMonth).mockResolvedValue(october2026MonthFixture)
    vi.mocked(listSpendingSeries).mockResolvedValue([])

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
      expect(screen.getByText(/£25\.00 \/ £175\.00/)).toBeInTheDocument()
    })
    expect(screen.getByRole('heading', { name: 'Coming up' })).toBeInTheDocument()
    const comingUpRow = screen.getByRole('listitem')
    expect(comingUpRow).toHaveTextContent('20th · C · Transport')
    expect(screen.queryByText('A', { exact: true })).not.toBeInTheDocument()
  })
})
