import { render, screen, waitFor } from '@testing-library/react'
import { apiFetch } from '@/api/apiClient'
import { DevelopmentEnvironmentBanner } from '@/components/DevelopmentEnvironmentBanner'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/api/apiClient', () => ({
  apiFetch: vi.fn(),
}))

describe('DevelopmentEnvironmentBanner', () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset()
  })

  it('renders when session response includes Development header', async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ authenticated: false }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Spenny-Environment': 'Development',
        },
      }),
    )
    render(<DevelopmentEnvironmentBanner />)
    await waitFor(() => {
      expect(screen.getByRole('status', { name: 'Development environment' })).toHaveTextContent('Development')
    })
  })

  it('renders nothing for Production or failed probes', async () => {
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
    const { container: prod } = render(<DevelopmentEnvironmentBanner />)
    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledTimes(2)
    })
    expect(prod).toBeEmptyDOMElement()

    vi.mocked(apiFetch)
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
    const { container: failed } = render(<DevelopmentEnvironmentBanner />)
    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledTimes(4)
    })
    expect(failed).toBeEmptyDOMElement()
  })
})
