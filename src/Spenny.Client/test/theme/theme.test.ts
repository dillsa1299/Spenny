import { describe, expect, it } from 'vitest'
import { spennyTheme } from '@/theme/theme'

describe('spennyTheme', () => {
  it('uses dark mode with brand accent colours', () => {
    expect(spennyTheme.palette.mode).toBe('dark')
    expect(spennyTheme.palette.primary.main).toBe('#52b788')
    expect(spennyTheme.palette.error.main).toBe('#e63946')
  })
})
