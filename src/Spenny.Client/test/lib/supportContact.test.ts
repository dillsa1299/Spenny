import { SUPPORT_EMAIL, SUPPORT_MAILTO } from '@/lib/supportContact'
import { describe, expect, it } from 'vitest'

describe('supportContact', () => {
  it('exposes the public support email and mailto link', () => {
    expect(SUPPORT_EMAIL).toBe('support@irwin.link')
    expect(SUPPORT_MAILTO).toBe('mailto:support@irwin.link')
  })
})
