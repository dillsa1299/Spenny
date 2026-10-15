import { render, screen, waitFor } from '@testing-library/react'
import App from '@/App'
import { AppProviders } from '@/providers/AppProviders'
import { stubGuestSession } from '@/test/renderApp'
import { describe, expect, it } from 'vitest'

describe('App', () => {
  it('renders the public shell via AppRouter', async () => {
    stubGuestSession()
    render(
      <AppProviders>
        <App />
      </AppProviders>,
    )

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Join now' })).toBeInTheDocument()
    })
  })
})
