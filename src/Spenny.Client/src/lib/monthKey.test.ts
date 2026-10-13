import { describe, expect, it } from 'vitest'
import {
  formatMonthLabel,
  getCurrentMonthInLondon,
  monthKeyFromDate,
  shiftMonth,
} from '@/lib/monthKey'

describe('monthKey', () => {
  it('reads Europe/London calendar month from a UTC instant', () => {
    expect(monthKeyFromDate(new Date('2025-12-31T23:30:00.000Z'))).toEqual({ year: 2025, month: 12 })
    expect(monthKeyFromDate(new Date('2026-01-01T12:00:00.000Z'))).toEqual({ year: 2026, month: 1 })
  })

  it('getCurrentMonthInLondon uses the provided clock', () => {
    expect(getCurrentMonthInLondon(new Date('2026-10-15T12:00:00.000Z'))).toEqual({
      year: 2026,
      month: 10,
    })
  })

  it('shiftMonth crosses year boundaries', () => {
    expect(shiftMonth({ year: 2026, month: 12 }, 1)).toEqual({ year: 2027, month: 1 })
    expect(shiftMonth({ year: 2026, month: 1 }, -1)).toEqual({ year: 2025, month: 12 })
  })

  it('formatMonthLabel renders long month and year', () => {
    expect(formatMonthLabel({ year: 2026, month: 10 })).toBe('October 2026')
  })
})
