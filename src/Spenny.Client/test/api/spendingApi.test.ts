import { apiFetch } from '@/api/apiClient'
import { fetchSpendingMonth } from '@/api/spendingApi'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/api/apiClient', () => ({
  apiFetch: vi.fn(),
  readApiError: vi.fn(),
}))

describe('spendingApi', () => {
  it('fetchSpendingMonth calls month route', async () => {
    vi.mocked(apiFetch).mockResolvedValue(
      new Response(JSON.stringify({ year: 2026, month: 10 }), { status: 200 }),
    )
    const result = await fetchSpendingMonth(2026, 10)
    expect(apiFetch).toHaveBeenCalledWith('/api/spending/months/2026/10')
    expect(result.year).toBe(2026)
  })
})
