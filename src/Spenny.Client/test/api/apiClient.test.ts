import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiFetch, readApiError } from '@/api/apiClient'

describe('apiClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('apiFetch calls fetch with credentials and JSON content type', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    await apiFetch('/api/auth/session')

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/auth/session',
      expect.objectContaining({
        credentials: 'include',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      }),
    )
  })

  it('readApiError prefers message from JSON body', async () => {
    const response = new Response(JSON.stringify({ message: 'Bad request' }), { status: 400 })
    await expect(readApiError(response)).resolves.toBe('Bad request')
  })

  it('readApiError falls back to status text when body is not JSON', async () => {
    const response = new Response('nope', { status: 500, statusText: 'Server Error' })
    await expect(readApiError(response)).resolves.toBe('Server Error')
  })
})
