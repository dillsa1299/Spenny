import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiFetch } from '@/api/apiClient'
import { loginLocal, startGoogleSignIn } from '@/api/authApi'

vi.mock('@/api/apiClient', () => ({
  apiFetch: vi.fn(),
  readApiError: vi.fn(async (response: Response) => response.statusText),
}))

describe('authApi', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('loginLocal returns user on success', async () => {
    const user = {
      id: '1',
      email: 'a@b.com',
      displayName: 'A',
      emailConfirmed: true,
      authProvider: 'local',
      isAdmin: false,
    }
    vi.mocked(apiFetch).mockResolvedValue(
      new Response(JSON.stringify(user), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    )

    const result = await loginLocal('a@b.com', 'secret')
    expect(result).toEqual({ ok: true, user })
  })

  it('startGoogleSignIn navigates to the OAuth URL', () => {
    const assign = vi.fn()
    vi.stubGlobal('location', { assign } as unknown as Location)

    startGoogleSignIn('/dashboard')

    expect(assign).toHaveBeenCalledWith('/api/auth/google?returnUrl=%2Fdashboard')
  })
})
