// Amount required by sheet: future-date validation, fetch, and total / zero display.
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { fetchAmountRequiredBy } from '@/api/spendingApi'
import { AmountRequiredBySheet } from '@/components/spending/AmountRequiredBySheet'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/api/spendingApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/spendingApi')>()
  return {
    ...actual,
    fetchAmountRequiredBy: vi.fn(),
  }
})

function setTargetDate(value: string) {
  fireEvent.change(screen.getByLabelText('Or pick a date'), { target: { value } })
}

describe('AmountRequiredBySheet', () => {
  beforeEach(() => {
    vi.mocked(fetchAmountRequiredBy).mockReset()
  })

  it('rejects today-or-earlier without calling the API', () => {
    render(<AmountRequiredBySheet open onClose={() => undefined} asOfDate="2026-10-10" />)

    setTargetDate('2026-10-10')

    expect(screen.getByText('Choose a date after today.')).toBeInTheDocument()
    expect(fetchAmountRequiredBy).not.toHaveBeenCalled()
  })

  it('fetches and shows the total for a future target date', async () => {
    vi.mocked(fetchAmountRequiredBy).mockResolvedValue({
      asOfDate: '2026-10-10',
      targetDate: '2026-10-20',
      total: 125,
    })

    render(<AmountRequiredBySheet open onClose={() => undefined} asOfDate="2026-10-10" />)
    setTargetDate('2026-10-20')

    await waitFor(() => {
      expect(fetchAmountRequiredBy).toHaveBeenCalledWith('2026-10-20')
    })
    expect(await screen.findByText('£125.00')).toBeInTheDocument()
  })

  it('shows £0.00 when the window has no matching bills', async () => {
    vi.mocked(fetchAmountRequiredBy).mockResolvedValue({
      asOfDate: '2026-10-10',
      targetDate: '2026-10-20',
      total: 0,
    })

    render(<AmountRequiredBySheet open onClose={() => undefined} asOfDate="2026-10-10" />)
    setTargetDate('2026-10-20')

    expect(await screen.findByText('£0.00')).toBeInTheDocument()
    expect(await screen.findByText('Nothing due in this window')).toBeInTheDocument()
  })

  it('applies a quick preset date', async () => {
    vi.mocked(fetchAmountRequiredBy).mockResolvedValue({
      asOfDate: '2026-10-10',
      targetDate: '2026-10-17',
      total: 40,
    })

    render(<AmountRequiredBySheet open onClose={() => undefined} asOfDate="2026-10-10" />)
    fireEvent.click(screen.getByRole('button', { name: 'In 1 week' }))

    await waitFor(() => {
      expect(fetchAmountRequiredBy).toHaveBeenCalledWith('2026-10-17')
    })
    expect(await screen.findByText('£40.00')).toBeInTheDocument()
  })
})
