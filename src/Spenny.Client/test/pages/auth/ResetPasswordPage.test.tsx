import { screen, waitFor } from '@testing-library/react'
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage'
import { renderPage } from '@/test/renderPage'
import { describe, expect, it } from 'vitest'

describe('ResetPasswordPage', () => {
  it('renders new password heading', async () => {
    renderPage(<ResetPasswordPage />, { route: '/reset-password' })
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 5, name: 'Choose a new password' })).toBeInTheDocument()
    })
  })
})
