/**
 * Cookie consent banner: first visit, persist Accept/Reject, non-essential gate, reopen settings.
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import {
  COOKIE_CONSENT_STORAGE_KEY,
  canLoadNonEssential,
} from '@/consent/cookieConsentStorage'
import { CookieConsentProvider, useCookieConsent } from '@/consent/CookieConsentContext'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

function GateProbe() {
  const { canLoadNonEssential: allowed } = useCookieConsent()
  return <span data-testid="gate">{allowed ? 'open' : 'closed'}</span>
}

function renderConsentApp() {
  return render(
    <MemoryRouter>
      <CookieConsentProvider>
        <GateProbe />
      </CookieConsentProvider>
    </MemoryRouter>,
  )
}

describe('CookieConsentProvider', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('shows the banner on first visit', () => {
    renderConsentApp()

    expect(screen.getByRole('dialog', { name: 'Cookies' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Accept all' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reject non-essential' })).toBeInTheDocument()
    expect(screen.getByTestId('gate')).toHaveTextContent('closed')
    expect(canLoadNonEssential()).toBe(false)
  })

  it('dismisses after Accept, persists across remount, and opens the gate', async () => {
    const user = userEvent.setup()
    const { unmount } = renderConsentApp()

    await user.click(screen.getByRole('button', { name: 'Accept all' }))

    expect(screen.queryByRole('dialog', { name: 'Cookies' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cookie settings' })).toBeInTheDocument()
    expect(screen.getByTestId('gate')).toHaveTextContent('open')
    expect(canLoadNonEssential()).toBe(true)

    unmount()
    renderConsentApp()

    expect(screen.queryByRole('dialog', { name: 'Cookies' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cookie settings' })).toBeInTheDocument()
    expect(canLoadNonEssential()).toBe(true)
  })

  it('dismisses after Reject, persists across remount, and keeps the gate closed', async () => {
    const user = userEvent.setup()
    const { unmount } = renderConsentApp()

    await user.click(screen.getByRole('button', { name: 'Reject non-essential' }))

    expect(screen.queryByRole('dialog', { name: 'Cookies' })).not.toBeInTheDocument()
    expect(screen.getByTestId('gate')).toHaveTextContent('closed')
    expect(canLoadNonEssential()).toBe(false)
    expect(JSON.parse(localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)!).decision).toBe(
      'rejected',
    )

    unmount()
    renderConsentApp()

    expect(screen.queryByRole('dialog', { name: 'Cookies' })).not.toBeInTheDocument()
    expect(canLoadNonEssential()).toBe(false)
  })

  it('Cookie settings clears the choice and restores the banner', async () => {
    const user = userEvent.setup()
    renderConsentApp()

    await user.click(screen.getByRole('button', { name: 'Accept all' }))
    await user.click(screen.getByRole('button', { name: 'Cookie settings' }))

    expect(screen.getByRole('dialog', { name: 'Cookies' })).toBeInTheDocument()
    expect(localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)).toBeNull()
    expect(canLoadNonEssential()).toBe(false)
  })
})
