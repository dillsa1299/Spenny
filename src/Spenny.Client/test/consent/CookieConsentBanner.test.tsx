/**
 * Smoke coverage for the cookie consent dialog chrome (mirrored under test/consent).
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { CookieConsentBanner } from '@/consent/CookieConsentBanner'
import { describe, expect, it, vi } from 'vitest'

describe('CookieConsentBanner', () => {
  it('exposes Accept and Reject actions and a policy link', async () => {
    const user = userEvent.setup()
    const onAccept = vi.fn()
    const onReject = vi.fn()

    render(
      <MemoryRouter>
        <CookieConsentBanner onAccept={onAccept} onReject={onReject} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('dialog', { name: 'Cookies' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Cookie policy' })).toHaveAttribute('href', '/cookies')

    await user.click(screen.getByRole('button', { name: 'Accept all' }))
    expect(onAccept).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'Reject non-essential' }))
    expect(onReject).toHaveBeenCalledTimes(1)
  })
})
