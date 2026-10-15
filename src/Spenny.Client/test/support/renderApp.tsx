/**
 * Integration test harness: AppProviders + MemoryRouter with the same route tree as AppRouter.
 * Mock session via vi.mocked(fetchSession) before calling renderAppAt.
 */
import { render, type RenderOptions } from '@testing-library/react'
import {
  createMemoryRouter,
  createRoutesFromElements,
  Outlet,
  Route,
  RouterProvider,
} from 'react-router-dom'
import { fetchAuthProviders, fetchSession } from '@/api/authApi'
import { AppProviders } from '@/providers/AppProviders'
import { AppRouteTree } from '@/routes/AppRouter'
import { guestSession } from '@/test/sessionFixtures'
import { vi } from 'vitest'

export function stubGuestSession(): void {
  vi.mocked(fetchSession).mockResolvedValue(guestSession)
  vi.mocked(fetchAuthProviders).mockResolvedValue({ google: false })
}

type RenderAppOptions = {
  initialPath?: string
  renderOptions?: Omit<RenderOptions, 'wrapper'>
}

export function renderAppAt({ initialPath = '/', renderOptions }: RenderAppOptions = {}) {
  const router = createMemoryRouter(
    createRoutesFromElements(
      <Route element={<AppProviders><Outlet /></AppProviders>}>
        {AppRouteTree()}
      </Route>,
    ),
    { initialEntries: [initialPath], initialIndex: 0 },
  )

  return {
    router,
    ...render(<RouterProvider router={router} />, renderOptions),
  }
}
