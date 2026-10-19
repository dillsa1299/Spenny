import { groupOccurrencesByDate } from '@/spending/groupOccurrencesByDate'
import { october2026MonthFixture } from '@/test/spendingMonthFixture'
import { describe, expect, it } from 'vitest'

describe('groupOccurrencesByDate', () => {
  it('groups consecutive same-date occurrences in input order', () => {
    const groups = groupOccurrencesByDate(october2026MonthFixture.occurrences)
    expect(groups.map((g) => g.effectiveDate)).toEqual(['2026-10-05', '2026-10-20'])
    expect(groups[0].items.map((o) => o.name)).toEqual(['A', 'B'])
    expect(groups[1].items.map((o) => o.name)).toEqual(['C'])
  })

  it('returns no groups for no occurrences', () => {
    expect(groupOccurrencesByDate([])).toEqual([])
  })
})
