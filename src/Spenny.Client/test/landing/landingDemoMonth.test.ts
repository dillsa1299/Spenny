import { landingDemoMonth } from '@/landing/landingDemoMonth'
import { describe, expect, it } from 'vitest'

describe('landingDemoMonth', () => {
  it('keeps totals aligned with occurrences and burndown steps', () => {
    const occurrenceTotal = landingDemoMonth.occurrences.reduce((sum, o) => sum + o.amount, 0)
    expect(landingDemoMonth.monthTotal).toBe(occurrenceTotal)

    const lastStep = landingDemoMonth.burndownSteps.at(-1)
    expect(lastStep?.remainingAfter).toBe(0)

    const upcomingSum = landingDemoMonth.upcomingOccurrenceIds.reduce((sum, id) => {
      const row = landingDemoMonth.occurrences.find(
        (o) => o.seriesId === id.seriesId && o.occurrenceDate === id.occurrenceDate,
      )
      return sum + (row?.amount ?? 0)
    }, 0)
    expect(landingDemoMonth.remainingAtToday).toBe(upcomingSum)
    expect(landingDemoMonth.burndownSteps.length).toBe(10)
    expect(landingDemoMonth.remainingAtToday).toBe(190)
  })
})
