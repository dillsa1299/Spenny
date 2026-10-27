/**
 * Smoke test: /cookies renders the structured cookie policy under AppShell.
 */
import { screen, waitFor, within } from '@testing-library/react'
import { renderAppAt, stubGuestSession } from '@/test/renderApp'
import { beforeEach, describe, expect, it } from 'vitest'

describe('CookiePolicyPage', () => {
  beforeEach(() => {
    localStorage.clear()
    stubGuestSession()
  })

  it('renders the cookie policy heading and structured sections at /cookies', async () => {
    renderAppAt({ initialPath: '/cookies' })

    const article = await screen.findByRole('article')
    await waitFor(() => {
      expect(within(article).getByRole('heading', { name: 'Cookie policy' })).toBeInTheDocument()
    })
    expect(
      within(article).getByRole('heading', { name: '3. Strictly necessary cookies' }),
    ).toBeInTheDocument()
    expect(within(article).getByText('spenny.auth', { selector: 'code' })).toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: 'Cookies' })).toBeInTheDocument()
    expect(within(article).getAllByRole('link', { name: 'privacy policy' })[0]).toHaveAttribute(
      'href',
      '/privacy',
    )
    expect(within(article).getByRole('link', { name: 'support@irwin.link' })).toHaveAttribute(
      'href',
      'mailto:support@irwin.link',
    )
    expect(within(article).getByRole('button', { name: 'Change cookie settings' })).toBeInTheDocument()
  })

  it('adds bottom padding while the banner is open so the last lines stay readable', async () => {
    renderAppAt({ initialPath: '/cookies' })

    const article = await screen.findByRole('article')
    expect(article).toHaveStyle({ paddingBottom: '280px' })
  })
})

