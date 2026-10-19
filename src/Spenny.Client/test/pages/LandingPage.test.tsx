import { screen, waitFor } from '@testing-library/react'
import { LandingPage } from '@/pages/LandingPage'
import { renderPage } from '@/test/renderPage'
import { describe, expect, it } from 'vitest'

describe('LandingPage', () => {
  it('shows primary CTAs linking to auth entry points', async () => {
    renderPage(<LandingPage />)
    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Join now' })).toBeInTheDocument()
    })
    const join = screen.getByRole('link', { name: 'Join now' })
    const signIn = screen.getByRole('link', { name: 'Sign in' })
    expect(join).toHaveAttribute('href', '/sign-up')
    expect(signIn).toHaveAttribute('href', '/sign-in')
  })

  it('shows illustrative demo burndown and coming up', async () => {
    renderPage(<LandingPage />)

    expect(screen.getByRole('heading', { name: 'See it in action' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Spenny' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /left of this month/i })).toBeInTheDocument()
    expect(screen.getByText('No mark-paid')).toBeInTheDocument()
    expect(screen.getByText('Example data — not your account.')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('/ £747.00')).toBeInTheDocument()
    })

    expect(screen.getByRole('heading', { name: 'Coming up' })).toBeInTheDocument()
    expect(screen.getByText('Netflix')).toBeInTheDocument()
    expect(screen.queryByText('Rent', { exact: true })).not.toBeInTheDocument()
  })
})
