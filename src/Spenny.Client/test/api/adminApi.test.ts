import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiFetch } from '@/api/apiClient'
import { fetchAdminStats } from '@/api/adminApi'

vi.mock('@/api/adminApi', async (importOriginal) => {
  return await importOriginal<typeof import('@/api/adminApi')>()
})

vi.mock('@/api/apiClient', () => ({
  apiFetch: vi.fn(),
  readApiError: vi.fn(async (response: Response) => response.statusText),
}))

describe('adminApi', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('fetchAdminStats GETs /api/admin/stats', async () => {
    const stats = {
      totalUsers: 1,
      signUpsLast24Hours: 0,
      signUpsLast7Days: 1,
      uniqueLoginsLast24Hours: 0,
      googleAccounts: 0,
      localAccounts: 1,
      totalSpendingSeries: 2,
    }
    vi.mocked(apiFetch).mockResolvedValue(
      new Response(JSON.stringify(stats), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    )

    const result = await fetchAdminStats()
    expect(result).toEqual(stats)
    expect(apiFetch).toHaveBeenCalledWith('/api/admin/stats')
  })
})
