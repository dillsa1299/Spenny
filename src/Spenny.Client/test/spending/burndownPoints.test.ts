import { buildBurndownPoints } from '@/spending/burndownPoints'
import { describe, expect, it } from 'vitest'

describe('buildBurndownPoints', () => {
  it('steps down on burndown dates', () => {
    const points = buildBurndownPoints(2026, 10, 175, [
      { effectiveDate: '2026-10-05', dayTotal: 150, remainingAfter: 25 },
      { effectiveDate: '2026-10-20', dayTotal: 25, remainingAfter: 0 },
    ])
    expect(points[0].remaining).toBe(175)
    expect(points[4].remaining).toBe(25)
    expect(points[19].remaining).toBe(0)
  })
})
