import { render, screen, waitFor } from '@testing-library/react'
import { StrictMode } from 'react'
import App from '@/App'
import { AppProviders } from '@/providers/AppProviders'
import { stubGuestSession } from '@/test/renderApp'
import { describe, expect, it } from 'vitest'

describe('main entry composition', () => {
  it('matches main.tsx provider + app tree', { timeout: 15_000 }, async () => {
    stubGuestSession()
    render(
      <StrictMode>
        <AppProviders>
          <App />
        </AppProviders>
      </StrictMode>,
    )

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Join now' })).toBeInTheDocument()
    })
  })
})
