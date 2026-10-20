import { welcomeDisplayName } from '@/lib/welcomeDisplayName'
import { verifiedUser } from '@/test/sessionFixtures'
import { describe, expect, it } from 'vitest'

describe('welcomeDisplayName', () => {
  it('uses trimmed display name when present', () => {
    expect(welcomeDisplayName({ ...verifiedUser, displayName: '  Alex  ' })).toBe('Alex')
  })

  it('falls back to email local-part when display name is empty', () => {
    expect(welcomeDisplayName({ ...verifiedUser, displayName: '   ', email: 'jane.doe@example.com' })).toBe(
      'jane.doe',
    )
  })

  it('returns neutral copy when name and email are missing', () => {
    expect(welcomeDisplayName(null)).toBe('there')
    expect(welcomeDisplayName({ ...verifiedUser, displayName: '', email: '' })).toBe('there')
  })
})
