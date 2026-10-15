import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { AppProviders } from '@/providers/AppProviders'
import { stubGuestSession } from '@/test/renderApp'

type RenderPageOptions = {
  route?: string
  renderOptions?: Omit<RenderOptions, 'wrapper'>
}

/** Renders a page/module with the same providers as the SPA (guest session by default). */
export function renderPage(ui: ReactElement, { route = '/', renderOptions }: RenderPageOptions = {}) {
  stubGuestSession()
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AppProviders>{ui}</AppProviders>
    </MemoryRouter>,
    renderOptions,
  )
}
