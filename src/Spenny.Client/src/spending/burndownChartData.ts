// Maps month burndown domain points into MUI X LineChart axis and series arrays.
import type { BurndownStepDto } from '@/api/spendingTypes'
import { buildBurndownPoints, type BurndownPoint } from '@/spending/burndownPoints'

export function isoDateForDay(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

export type BurndownLineChartData = {
  xDays: number[]
  remainingValues: number[]
  points: ReturnType<typeof buildBurndownPoints>
}

export function buildBurndownLineChartData(
  year: number,
  month: number,
  monthTotal: number,
  burndownSteps: BurndownStepDto[],
): BurndownLineChartData {
  const points = buildBurndownPoints(year, month, monthTotal, burndownSteps)
  const xDays = points.map((p) => p.day)
  const remainingValues = points.map((p) => p.remaining)
  return { xDays, remainingValues, points }
}

export type BurndownAxisMarkers = {
  /** Calendar days where the step line moves (start of month + each payment day). */
  labelDays: number[]
  /** Remaining amounts at horizontal segments (plateaus before/after each step). */
  labelAmounts: number[]
}

export function burndownAxisMarkers(points: BurndownPoint[]): BurndownAxisMarkers {
  if (points.length === 0) {
    return { labelDays: [], labelAmounts: [] }
  }

  const labelDays: number[] = []
  const amountSet = new Set<number>()

  for (let i = 0; i < points.length; i += 1) {
    const changed = i === 0 || points[i].remaining !== points[i - 1].remaining
    if (!changed) {
      continue
    }
    labelDays.push(points[i].day)
    amountSet.add(points[i].remaining)
    if (i > 0) {
      amountSet.add(points[i - 1].remaining)
    }
  }

  const labelAmounts = [...amountSet].sort((a, b) => a - b)
  return { labelDays, labelAmounts }
}

export function dayFromAxisHighlight(
  xDays: number[],
  dataIndex: number | undefined,
): number | null {
  if (dataIndex === undefined || dataIndex < 0 || dataIndex >= xDays.length) {
    return null
  }
  return xDays[dataIndex] ?? null
}
