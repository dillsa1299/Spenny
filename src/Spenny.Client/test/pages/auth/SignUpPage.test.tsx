import { screen, waitFor } from '@testing-library/react'
import { SignUpPage } from '@/pages/auth/SignUpPage'
import { renderPage } from '@/test/renderPage'
import { describe, expect, it } from 'vitest'

describe('SignUpPage', () => {
  it('renders registration heading', async () => {
    renderPage(<SignUpPage />, { route: '/sign-up' })
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 5, name: 'Join Spenny' })).toBeInTheDocument()
    })
  })
})
