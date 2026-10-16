import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { fetchSession } from '@/api/authApi'
import { fetchSpendingMonth, listSpendingSeries } from '@/api/spendingApi'
import { AppProviders } from '@/providers/AppProviders'
import { SpendingPage } from '@/pages/SpendingPage'
import { SelectedMonthProvider } from '@/month/SelectedMonthContext'
import { emptySeriesFixture, october2026MonthFixture } from '@/test/spendingMonthFixture'
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

describe('SpendingPage', () => {
  it('lists all month occurrences from API', async () => {
    vi.mocked(fetchSession).mockResolvedValue(verifiedSession)
    vi.mocked(fetchSpendingMonth).mockResolvedValue(october2026MonthFixture)
    vi.mocked(listSpendingSeries).mockResolvedValue([emptySeriesFixture])

    render(
      <MemoryRouter>
        <AppProviders>
          <SelectedMonthProvider>
            <SpendingPage />
          </SelectedMonthProvider>
        </AppProviders>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('A')).toBeInTheDocument()
    })
    expect(screen.getByText('B')).toBeInTheDocument()
    expect(screen.getByText('C')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add spending' })).toBeInTheDocument()
  })
})
