import { formatCalendarDay } from '@/lib/formatCalendarDay'
import { describe, expect, it } from 'vitest'

describe('formatCalendarDay', () => {
  it('formats ordinal day and month name', () => {
    expect(formatCalendarDay('2026-10-20')).toBe('20th October')
    expect(formatCalendarDay('2026-02-01')).toBe('1st February')
  })
})
