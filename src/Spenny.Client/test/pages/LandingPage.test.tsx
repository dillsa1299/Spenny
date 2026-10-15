import { screen, waitFor } from '@testing-library/react'
import { LandingPage } from '@/pages/LandingPage'
import { renderPage } from '@/test/renderPage'
import { describe, expect, it } from 'vitest'

describe('LandingPage', () => {
  it('shows primary CTAs', async () => {
    renderPage(<LandingPage />)
    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Join now' })).toBeInTheDocument()
    })
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument()
  })
})
