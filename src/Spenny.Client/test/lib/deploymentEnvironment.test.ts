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

  it('returns true when session response includes Development header', async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ authenticated: false }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Spenny-Environment': 'Development',
        },
      }),
    )

    const { result } = renderHook(() => useShowDevelopmentBanner())

    await waitFor(() => {
      expect(result.current).toBe(true)
    })
    expect(apiFetch).toHaveBeenCalledWith('/api/auth/session')
  })

  it('returns true when health JSON reports Development', async () => {
    vi.mocked(apiFetch)
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ authenticated: false }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'X-Spenny-Environment': 'Production' },
        }),
      )
      .mockResolvedValueOnce(
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

  it('stays false for Production', async () => {
    vi.mocked(apiFetch)
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ authenticated: false }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'X-Spenny-Environment': 'Production' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ status: 'ok', environment: 'Production' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )

    const { result } = renderHook(() => useShowDevelopmentBanner())

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledTimes(2)
    })
    expect(result.current).toBe(false)
  })
})
