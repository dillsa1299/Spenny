/**
 * Unit tests for versioned cookie consent persistence and the non-essential gate.
 */
import {
  COOKIE_CONSENT_STORAGE_KEY,
  COOKIE_CONSENT_VERSION,
  canLoadNonEssential,
  clearCookieConsent,
  readCookieConsent,
  writeCookieConsent,
} from '@/consent/cookieConsentStorage'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('cookieConsentStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
    vi.useRealTimers()
  })

  it('returns null when nothing is stored', () => {
    expect(readCookieConsent()).toBeNull()
    expect(canLoadNonEssential()).toBe(false)
  })

  it('round-trips accept and enables the non-essential gate', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-27T12:00:00.000Z'))

    const written = writeCookieConsent('accepted')

    expect(written).toEqual({
      version: COOKIE_CONSENT_VERSION,
      decision: 'accepted',
      timestamp: '2026-10-27T12:00:00.000Z',
    })
    expect(readCookieConsent()).toEqual(written)
    expect(canLoadNonEssential()).toBe(true)
    expect(JSON.parse(localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)!)).toEqual(written)
  })

  it('round-trips reject and keeps the non-essential gate closed', () => {
    writeCookieConsent('rejected')

    expect(readCookieConsent()?.decision).toBe('rejected')
    expect(canLoadNonEssential()).toBe(false)
  })

  it('treats a mismatched policy version as no consent', () => {
    localStorage.setItem(
      COOKIE_CONSENT_STORAGE_KEY,
      JSON.stringify({
        version: '0',
        decision: 'accepted',
        timestamp: '2026-01-01T00:00:00.000Z',
      }),
    )

    expect(readCookieConsent()).toBeNull()
    expect(canLoadNonEssential()).toBe(false)
  })

  it('treats corrupt JSON as no consent', () => {
    localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, '{not-json')

    expect(readCookieConsent()).toBeNull()
    expect(canLoadNonEssential()).toBe(false)
  })

  it('clearCookieConsent removes the stored record', () => {
    writeCookieConsent('accepted')
    clearCookieConsent()

    expect(readCookieConsent()).toBeNull()
    expect(canLoadNonEssential()).toBe(false)
  })
})
