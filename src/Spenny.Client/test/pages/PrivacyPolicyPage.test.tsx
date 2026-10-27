/**
 * Smoke test: /privacy renders the structured privacy policy under AppShell.
 */
import { screen, waitFor, within } from '@testing-library/react'
import { renderAppAt, stubGuestSession } from '@/test/renderApp'
import { beforeEach, describe, expect, it } from 'vitest'

describe('PrivacyPolicyPage', () => {
  beforeEach(() => {
    localStorage.clear()
    stubGuestSession()
  })

  it('renders the privacy policy heading and key sections at /privacy', async () => {
    renderAppAt({ initialPath: '/privacy' })

    const article = await screen.findByRole('article')
    await waitFor(() => {
      expect(within(article).getByRole('heading', { name: 'Privacy policy' })).toBeInTheDocument()
    })
    expect(within(article).getByRole('heading', { name: '1. Who we are' })).toBeInTheDocument()
    expect(
      within(article).getByRole('heading', { name: '2. What data we collect' }),
    ).toBeInTheDocument()
    expect(within(article).getAllByRole('link', { name: 'cookie policy' })[0]).toHaveAttribute(
      'href',
      '/cookies',
    )
    expect(within(article).getByRole('link', { name: 'support@irwin.link' })).toHaveAttribute(
      'href',
      'mailto:support@irwin.link',
    )
    expect(within(article).queryByText(/open.source|counsel|not legal advice/i)).not.toBeInTheDocument()
  })
})

