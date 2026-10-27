/**
 * Smoke test: /cookies renders the policy stub under AppShell.
 */
import { screen, waitFor } from '@testing-library/react'
import { renderAppAt, stubGuestSession } from '@/test/renderApp'
import { beforeEach, describe, expect, it } from 'vitest'

describe('CookiePolicyPage', () => {
  beforeEach(() => {
    localStorage.clear()
    stubGuestSession()
  })

  it('renders the cookie policy heading at /cookies', async () => {
    renderAppAt({ initialPath: '/cookies' })

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Cookie policy' })).toBeInTheDocument()
    })
    expect(screen.getByText('spenny.auth', { selector: 'strong' })).toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: 'Cookies' })).toBeInTheDocument()
  })
})
