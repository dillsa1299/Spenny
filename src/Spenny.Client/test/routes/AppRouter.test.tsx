// Re-export coverage: route integration lives here; AppRouteTree is exercised via renderAppAt.
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fetchSession, logout } from '@/api/authApi'
import * as monthKey from '@/lib/monthKey'
import { AppRouteTree } from '@/routes/AppRouter'
import { renderAppAt, stubGuestSession } from '@/test/renderApp'
import { unverifiedSession, verifiedSession } from '@/test/sessionFixtures'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

function expectSignInPage(): void {
  expect(screen.getByRole('heading', { level: 5, name: 'Sign in' })).toBeInTheDocument()
}

function monthLabelInShell(): HTMLElement {
  const main = screen.getByRole('main')
  return within(main).getByText(/^[A-Z][a-z]+ \d{4}$/)
}

describe('AppRouter', () => {
  it('exports a route tree for tests', () => {
    expect(AppRouteTree()).toBeTruthy()
  })
})

describe('App routing', { timeout: 15_000 }, () => {
  beforeEach(() => {
    stubGuestSession()
    vi.spyOn(monthKey, 'getCurrentMonthInLondon').mockReturnValue({ year: 2026, month: 10 })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    stubGuestSession()
  })

  it('redirects unauthenticated users from shell routes to sign-in', async () => {
    const { router } = renderAppAt({ initialPath: '/dashboard' })

    await waitFor(() => {
      expectSignInPage()
    })
    expect(router.state.location.pathname).toBe('/sign-in')
    expect(router.state.location.state).toEqual({ from: '/dashboard' })
  })

  it('blocks guests from dashboard, spending, income, and profile', async () => {
    for (const path of ['/dashboard', '/spending', '/income', '/profile']) {
      const { router, unmount } = renderAppAt({ initialPath: path })
      await waitFor(() => {
        expectSignInPage()
      })
      expect(router.state.location.pathname).toBe('/sign-in')
      unmount()
      stubGuestSession()
    }
  })

  it('redirects unverified signed-in users away from shell routes', async () => {
    vi.mocked(fetchSession).mockResolvedValue(unverifiedSession)
    renderAppAt({ initialPath: '/dashboard' })

    await waitFor(() => {
      expectSignInPage()
    })
  })

  it('lets verified users reach dashboard and shows MonthSelector', async () => {
    vi.mocked(fetchSession).mockResolvedValue(verifiedSession)
    renderAppAt({ initialPath: '/dashboard' })

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: 'Previous month' })).toBeInTheDocument()
  })

  it('shows Income coming-soon copy', async () => {
    vi.mocked(fetchSession).mockResolvedValue(verifiedSession)
    renderAppAt({ initialPath: '/income' })

    await waitFor(() => {
      expect(screen.getByText('Coming soon')).toBeInTheDocument()
    })
    expect(screen.getByText('Money-in tracking is on the way')).toBeInTheDocument()
  })

  it('keeps selected month when navigating Dashboard to Spending', async () => {
    vi.mocked(fetchSession).mockResolvedValue(verifiedSession)
    const user = userEvent.setup({ delay: null })
    renderAppAt({ initialPath: '/dashboard' })

    await screen.findByRole('heading', { name: 'Dashboard' })

    const monthAfterAdvance = monthKey.formatMonthLabel(monthKey.shiftMonth({ year: 2026, month: 10 }, 1))
    await user.click(screen.getByRole('button', { name: 'Next month' }))
    expect(monthLabelInShell()).toHaveTextContent(monthAfterAdvance)

    const spendingTab = await screen.findByRole('button', { name: 'Spending' })
    await user.click(spendingTab)

    await screen.findByRole('heading', { name: 'Spending' })
    expect(monthLabelInShell()).toHaveTextContent(monthAfterAdvance)
  })

  it('Profile sign-out calls logout API', async () => {
    vi.mocked(fetchSession).mockResolvedValue(verifiedSession)
    const user = userEvent.setup({ delay: null })
    renderAppAt({ initialPath: '/profile' })

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Profile' })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Sign out' }))

    await waitFor(() => {
      expect(logout).toHaveBeenCalled()
    })
  })
})
