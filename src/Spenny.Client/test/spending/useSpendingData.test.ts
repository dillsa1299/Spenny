import { renderHook, waitFor } from '@testing-library/react'
import { fetchSpendingMonth, listSpendingSeries } from '@/api/spendingApi'
import { useSpendingData } from '@/spending/useSpendingData'
import { october2026MonthFixture } from '@/test/spendingMonthFixture'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/api/spendingApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/spendingApi')>()
  return {
    ...actual,
    fetchSpendingMonth: vi.fn(),
    listSpendingSeries: vi.fn(),
  }
})

describe('useSpendingData', () => {
  it('loads month and series', async () => {
    vi.mocked(fetchSpendingMonth).mockResolvedValue(october2026MonthFixture)
    vi.mocked(listSpendingSeries).mockResolvedValue([])

    const { result } = renderHook(() => useSpendingData({ year: 2026, month: 10 }, 0))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.month?.monthTotal).toBe(175)
  })
})
