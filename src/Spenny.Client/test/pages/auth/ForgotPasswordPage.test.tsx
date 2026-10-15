import { screen, waitFor } from '@testing-library/react'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { renderPage } from '@/test/renderPage'
import { describe, expect, it } from 'vitest'

describe('ForgotPasswordPage', () => {
  it('renders reset password heading', async () => {
    renderPage(<ForgotPasswordPage />, { route: '/forgot-password' })
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 5, name: 'Reset password' })).toBeInTheDocument()
    })
  })
})
