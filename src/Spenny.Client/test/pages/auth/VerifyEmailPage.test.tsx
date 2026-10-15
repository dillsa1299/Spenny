import { screen, waitFor } from '@testing-library/react'
import * as authApi from '@/api/authApi'
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage'
import { renderPage } from '@/test/renderPage'
import { describe, expect, it, vi } from 'vitest'

describe('VerifyEmailPage', () => {
  it('shows an error for an invalid verification link', async () => {
    renderPage(<VerifyEmailPage />, { route: '/verify-email' })
    await waitFor(() => {
      expect(screen.getByText('Invalid verification link.')).toBeInTheDocument()
    })
  })

  it('confirms email when query params are present', async () => {
    vi.spyOn(authApi, 'confirmEmail').mockResolvedValue({ message: 'Email confirmed.' })
    renderPage(<VerifyEmailPage />, {
      route: '/verify-email?userId=u1&token=tok',
    })
    await waitFor(() => {
      expect(screen.getByText('Email confirmed.')).toBeInTheDocument()
    })
  })
})
