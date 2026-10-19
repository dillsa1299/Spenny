import { describe, expect, it } from 'vitest'
import {
  buildBurndownLineChartData,
  burndownAxisMarkers,
  dayFromAxisHighlight,
  isoDateForDay,
  spacedAxisAmounts,
} from '@/spending/burndownChartData'

describe('burndownChartData', () => {
  it('builds aligned x days and remaining values', () => {
    const { xDays, remainingValues } = buildBurndownLineChartData(2026, 10, 100, [
      { effectiveDate: '2026-10-05', dayTotal: 40, remainingAfter: 60 },
    ])
    expect(xDays[0]).toBe(1)
    expect(xDays.at(-1)).toBe(31)
    expect(remainingValues[4]).toBe(60)
  })

  it('maps axis highlight index to calendar day', () => {
    const { xDays } = buildBurndownLineChartData(2026, 10, 50, [])
    expect(dayFromAxisHighlight(xDays, 4)).toBe(5)
    expect(dayFromAxisHighlight(xDays, undefined)).toBeNull()
  })

  it('formats iso date for day index', () => {
    expect(isoDateForDay(2026, 10, 5)).toBe('2026-10-05')
  })

  it('marks axis labels at step changes only', () => {
    const { points } = buildBurndownLineChartData(2026, 10, 175, [
      { effectiveDate: '2026-10-05', dayTotal: 100, remainingAfter: 75 },
      { effectiveDate: '2026-10-20', dayTotal: 50, remainingAfter: 25 },
    ])
    const markers = burndownAxisMarkers(points)
    expect(markers.labelDays).toEqual([1, 5, 20])
    expect(markers.labelAmounts).toEqual([25, 75, 175])
  })

  it('drops clustered y labels but keeps the range ends', () => {
    const spaced = spacedAxisAmounts([0, 10, 22, 27, 62, 90, 152, 190, 201, 249, 369], 1049, 0.1)
    expect(spaced[0]).toBe(0)
    expect(spaced.at(-1)).toBe(369)
    expect(spaced.every((value, i) => i === 0 || value - spaced[i - 1] >= 104.9)).toBe(true)
  })

  it('keeps short label lists untouched', () => {
    expect(spacedAxisAmounts([0, 75], 175, 0.1)).toEqual([0, 75])
  })
})
