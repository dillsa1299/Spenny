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

  it('renders when health reports Development environment', async () => {
    vi.mocked(apiFetch).mockResolvedValue(
      new Response(JSON.stringify({ status: 'ok', environment: 'Development' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    render(<DevelopmentEnvironmentBanner />)
    await waitFor(() => {
      expect(screen.getByRole('status', { name: 'Development environment' })).toHaveTextContent('Development')
    })
  })

  it('renders nothing for Production or failed health', async () => {
    vi.mocked(apiFetch).mockResolvedValue(
      new Response(JSON.stringify({ status: 'ok', environment: 'Production' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    const { container: prod } = render(<DevelopmentEnvironmentBanner />)
    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalled()
    })
    expect(prod).toBeEmptyDOMElement()

    vi.mocked(apiFetch).mockResolvedValue(new Response(null, { status: 503 }))
    const { container: failed } = render(<DevelopmentEnvironmentBanner />)
    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledTimes(2)
    })
    expect(failed).toBeEmptyDOMElement()
  })
})
