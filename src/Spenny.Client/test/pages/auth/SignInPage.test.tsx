import { screen, waitFor } from '@testing-library/react'
import { SignInPage } from '@/pages/auth/SignInPage'
import { renderPage } from '@/test/renderPage'
import { describe, expect, it } from 'vitest'

describe('SignInPage', () => {
  it('renders sign-in form fields', async () => {
    renderPage(<SignInPage />, { route: '/sign-in' })
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 5, name: 'Sign in' })).toBeInTheDocument()
    })
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })
})
