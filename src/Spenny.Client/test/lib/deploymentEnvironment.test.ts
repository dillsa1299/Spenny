import { renderHook, waitFor } from '@testing-library/react'
import { apiFetch } from '@/api/apiClient'
import { useShowDevelopmentBanner } from '@/lib/deploymentEnvironment'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/api/apiClient', () => ({
  apiFetch: vi.fn(),
}))

describe('useShowDevelopmentBanner', () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset()
  })

  it('returns true when health reports Development', async () => {
    vi.mocked(apiFetch).mockResolvedValue(
      new Response(JSON.stringify({ status: 'ok', environment: 'Development' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const { result } = renderHook(() => useShowDevelopmentBanner())

    await waitFor(() => {
      expect(result.current).toBe(true)
    })
  })

  it('stays false for Production or failed health', async () => {
    vi.mocked(apiFetch).mockResolvedValue(
      new Response(JSON.stringify({ status: 'ok', environment: 'Production' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const { result } = renderHook(() => useShowDevelopmentBanner())

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalled()
    })
    expect(result.current).toBe(false)
  })
})
