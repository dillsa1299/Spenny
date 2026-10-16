import { formatGbp } from '@/lib/formatGbp'
import { describe, expect, it } from 'vitest'

describe('formatGbp', () => {
  it('formats amounts in pounds', () => {
    expect(formatGbp(175)).toMatch(/175/)
    expect(formatGbp(175)).toContain('£')
  })
})
