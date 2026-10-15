import { describe, expect, it } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn', () => {
  it('merges tailwind classes with later wins', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('handles conditional class lists', () => {
    expect(cn('base', false && 'hidden', 'end')).toBe('base end')
  })
})
