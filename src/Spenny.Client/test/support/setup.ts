// Vitest + jsdom defaults: jest-dom matchers, stable motion prefs, mocked auth API boundary.
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  cleanup()
})

vi.mock('@/api/adminApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/adminApi')>()
  const emptyStats = {
    totalUsers: 0,
    signUpsLast24Hours: 0,
    signUpsLast7Days: 0,
    uniqueLoginsLast24Hours: 0,
    googleAccounts: 0,
    localAccounts: 0,
    totalSpendingSeries: 0,
  }
  return {
    ...actual,
    fetchAdminStats: vi.fn().mockResolvedValue(emptyStats),
  }
})

vi.mock('@/api/authApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/authApi')>()
  return {
    ...actual,
    fetchSession: vi.fn().mockResolvedValue({ authenticated: false }),
    fetchAuthProviders: vi.fn().mockResolvedValue({ google: false }),
    logout: vi.fn().mockResolvedValue(undefined),
  }
})

Object.defineProperty(document, 'fonts', {
  value: { ready: Promise.resolve() },
})

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(globalThis, 'ResizeObserver', {
  writable: true,
  value: ResizeObserverStub,
})

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
})
