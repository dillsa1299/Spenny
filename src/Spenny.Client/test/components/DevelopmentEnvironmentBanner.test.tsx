import { render, screen } from '@testing-library/react'
import { DevelopmentEnvironmentBanner } from '@/components/DevelopmentEnvironmentBanner'
import { afterEach, describe, expect, it, vi } from 'vitest'

describe('DevelopmentEnvironmentBanner', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('renders when VITE_DEPLOYMENT_ENV is development', () => {
    vi.stubEnv('VITE_DEPLOYMENT_ENV', 'development')
    render(<DevelopmentEnvironmentBanner />)
    expect(screen.getByRole('status', { name: 'Development environment' })).toHaveTextContent('Development')
  })

  it('renders nothing for production or unset deployment env', () => {
    vi.stubEnv('VITE_DEPLOYMENT_ENV', 'production')
    const { container: prod } = render(<DevelopmentEnvironmentBanner />)
    expect(prod).toBeEmptyDOMElement()

    vi.stubEnv('VITE_DEPLOYMENT_ENV', '')
    const { container: empty } = render(<DevelopmentEnvironmentBanner />)
    expect(empty).toBeEmptyDOMElement()
  })
})
