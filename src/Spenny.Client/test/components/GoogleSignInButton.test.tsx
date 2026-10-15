import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as authApi from '@/api/authApi'
import { GoogleSignInButton } from '@/components/GoogleSignInButton'
import { describe, expect, it, vi } from 'vitest'

describe('GoogleSignInButton', () => {
  it('starts Google sign-in when clicked', async () => {
    const start = vi.spyOn(authApi, 'startGoogleSignIn').mockImplementation(() => {})
    const user = userEvent.setup()

    render(<GoogleSignInButton returnPath="/dashboard" />)
    await user.click(screen.getByRole('button', { name: 'Continue with Google' }))

    expect(start).toHaveBeenCalledWith('/dashboard')
  })
})
