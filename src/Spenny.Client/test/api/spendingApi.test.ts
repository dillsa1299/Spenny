import { apiFetch } from '@/api/apiClient'
import { fetchSpendingMonth, skipSpendingOccurrence, upsertSpendingException } from '@/api/spendingApi'
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

  it('upsertSpendingException PUTs exception route', async () => {
    vi.mocked(apiFetch).mockResolvedValue(new Response('{}', { status: 200 }))
    await upsertSpendingException('series-id', '2026-10-01', {
      isSkipped: false,
      name: 'Rent',
      amount: 400,
      category: 0,
    })
    expect(apiFetch).toHaveBeenCalledWith(
      '/api/spending/series/series-id/exceptions/2026-10-01',
      expect.objectContaining({ method: 'PUT' }),
    )
  })

  it('skipSpendingOccurrence DELETEs exception route', async () => {
    vi.mocked(apiFetch).mockResolvedValue(new Response(null, { status: 204 }))
    await skipSpendingOccurrence('series-id', '2026-10-01')
    expect(apiFetch).toHaveBeenCalledWith(
      '/api/spending/series/series-id/exceptions/2026-10-01',
      { method: 'DELETE' },
    )
  })
})
