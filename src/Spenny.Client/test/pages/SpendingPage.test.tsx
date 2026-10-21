import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { fetchSession } from '@/api/authApi'
import { fetchSpendingMonth, listSpendingSeries } from '@/api/spendingApi'
import { AppProviders } from '@/providers/AppProviders'
import { SpendingPage } from '@/pages/SpendingPage'
import { SelectedMonthProvider } from '@/month/SelectedMonthContext'
import {
  emptySeriesFixture,
  october2026MonthFixture,
  recurringWeeklySeriesFixture,
} from '@/test/spendingMonthFixture'
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

  it('shows scope chooser for recurring occurrence then exception sheet', async () => {
    vi.mocked(fetchSession).mockResolvedValue(verifiedSession)
    vi.mocked(fetchSpendingMonth).mockResolvedValue(october2026MonthFixture)
    vi.mocked(listSpendingSeries).mockResolvedValue([emptySeriesFixture, recurringWeeklySeriesFixture])

    const user = userEvent.setup()

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
      expect(screen.getByText('B')).toBeInTheDocument()
    })

    await user.click(screen.getByText('B'))
    expect(screen.getByRole('dialog', { name: 'Edit spending' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'This date only' }))
    await waitFor(() => {
      expect(screen.getByText('Edit this date')).toBeInTheDocument()
    })
  })
})
