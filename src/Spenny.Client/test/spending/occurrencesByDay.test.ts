import { SpendingCategory } from '@/api/spendingTypes'
import { occurrencesByDay } from '@/spending/occurrencesByDay'
import { describe, expect, it } from 'vitest'

describe('occurrencesByDay', () => {
  it('groups by effective date day and sorts by name', () => {
    const map = occurrencesByDay([
      {
        id: { seriesId: 'a', occurrenceDate: '2026-10-05' },
        seriesId: 'a',
        occurrenceDate: '2026-10-05',
        effectiveDate: '2026-10-05',
        name: 'Zebra',
        amount: 10,
        category: SpendingCategory.General,
        description: null,
      },
      {
        id: { seriesId: 'b', occurrenceDate: '2026-10-05' },
        seriesId: 'b',
        occurrenceDate: '2026-10-05',
        effectiveDate: '2026-10-05',
        name: 'Alpha',
        amount: 20,
        category: SpendingCategory.Bills,
        description: null,
      },
    ])
    expect(map.get(5)?.map((o) => o.name)).toEqual(['Alpha', 'Zebra'])
  })
})
