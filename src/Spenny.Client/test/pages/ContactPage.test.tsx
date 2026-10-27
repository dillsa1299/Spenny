/**
 * Smoke test: /contact renders support email under AppShell.
 */
import { screen, waitFor, within } from '@testing-library/react'
import { renderAppAt, stubGuestSession } from '@/test/renderApp'
import { beforeEach, describe, expect, it } from 'vitest'

describe('ContactPage', () => {
  beforeEach(() => {
    localStorage.clear()
    stubGuestSession()
  })

  it('renders the contact heading and support email at /contact', async () => {
    renderAppAt({ initialPath: '/contact' })

    const article = await screen.findByRole('article')
    await waitFor(() => {
      expect(within(article).getByRole('heading', { name: 'Contact' })).toBeInTheDocument()
    })
    expect(within(article).getByRole('link', { name: 'support@irwin.link' })).toHaveAttribute(
      'href',
      'mailto:support@irwin.link',
    )
  })
})
