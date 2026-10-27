import { pathHasBottomNav } from '@/consent/cookieConsentLayout'
import { describe, expect, it } from 'vitest'

describe('pathHasBottomNav', () => {
  it('is true for signed-in shell routes', () => {
    expect(pathHasBottomNav('/dashboard')).toBe(true)
    expect(pathHasBottomNav('/spending')).toBe(true)
    expect(pathHasBottomNav('/admin')).toBe(true)
  })

  it('is false for public routes', () => {
    expect(pathHasBottomNav('/')).toBe(false)
    expect(pathHasBottomNav('/sign-in')).toBe(false)
    expect(pathHasBottomNav('/cookies')).toBe(false)
  })
})
