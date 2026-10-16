import { comingUpEmptyMessage } from '@/spending/comingUpCopy'
import { october2026MonthFixture } from '@/test/spendingMonthFixture'
import { describe, expect, it } from 'vitest'

describe('comingUpCopy', () => {
  it('uses complete-month copy for past months', () => {
    const message = comingUpEmptyMessage({
      ...october2026MonthFixture,
      year: 2026,
      month: 9,
      upcomingOccurrenceIds: [],
    })
    expect(message).toContain('complete')
  })
})
