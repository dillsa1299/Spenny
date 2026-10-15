import { screen, waitFor } from '@testing-library/react'
import { CheckEmailPage } from '@/pages/auth/CheckEmailPage'
import { renderPage } from '@/test/renderPage'
import { describe, expect, it } from 'vitest'

describe('CheckEmailPage', () => {
  it('renders check-email guidance', async () => {
    renderPage(<CheckEmailPage />, { route: '/check-email' })
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 5, name: 'Check your email' })).toBeInTheDocument()
    })
  })
})
