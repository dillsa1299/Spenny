import { describe, expect, it } from 'vitest'
import {
  buildBurndownLineChartData,
  burndownAxisMarkers,
  dayFromAxisHighlight,
  isoDateForDay,
  MONTH_START_ANCHOR_DAY,
  spacedAxisAmounts,
} from '@/spending/burndownChartData'

describe('burndownChartData', () => {
  it('builds aligned x days and remaining values behind a month-start anchor', () => {
    const { xDays, remainingValues } = buildBurndownLineChartData(2026, 10, 100, [
      { effectiveDate: '2026-10-05', dayTotal: 40, remainingAfter: 60 },
    ])
    expect(xDays[0]).toBe(MONTH_START_ANCHOR_DAY)
    expect(remainingValues[0]).toBe(100)
    expect(xDays.at(-1)).toBe(31)
    expect(remainingValues[xDays.indexOf(5)]).toBe(60)
  })

  it('maps axis highlight index to calendar day and ignores the anchor', () => {
    const { xDays } = buildBurndownLineChartData(2026, 10, 50, [])
    expect(dayFromAxisHighlight(xDays, 5)).toBe(5)
    expect(dayFromAxisHighlight(xDays, 0)).toBeNull()
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
    const markers = burndownAxisMarkers(points, 175)
    expect(markers.labelDays).toEqual([1, 5, 20])
    expect(markers.labelAmounts).toEqual([25, 75, 175])
  })

  it('labels the starting balance when the 1st already has payments', () => {
    const { points } = buildBurndownLineChartData(2026, 10, 1000, [
      { effectiveDate: '2026-10-01', dayTotal: 700, remainingAfter: 300 },
    ])
    const markers = burndownAxisMarkers(points, 1000)
    expect(markers.labelDays).toEqual([1])
    expect(markers.labelAmounts).toEqual([300, 1000])
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
