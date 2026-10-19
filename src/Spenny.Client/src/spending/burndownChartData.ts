// Maps month burndown domain points into MUI X LineChart axis and series arrays.
import type { BurndownStepDto } from '@/api/spendingTypes'
import { buildBurndownPoints, type BurndownPoint } from '@/spending/burndownPoints'

export function isoDateForDay(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

/**
 * Pseudo-day plotted before the 1st so the step line starts at the full month total.
 * Not a calendar day: it carries no payments and must not be labelled or highlighted.
 */
export const MONTH_START_ANCHOR_DAY = 0

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
  // Day 1 already holds the balance after the 1st's payments, so without this anchor the usual
  // step-down is missing for the busiest day of the month and the plot top sits empty.
  const xDays = [MONTH_START_ANCHOR_DAY, ...points.map((p) => p.day)]
  const remainingValues = [monthTotal, ...points.map((p) => p.remaining)]
  return { xDays, remainingValues, points }
}

export type BurndownAxisMarkers = {
  /** Calendar days where the step line moves (start of month + each payment day). */
  labelDays: number[]
  /** Remaining amounts at horizontal segments (plateaus before/after each step). */
  labelAmounts: number[]
}

export function burndownAxisMarkers(
  points: BurndownPoint[],
  startingBalance: number,
): BurndownAxisMarkers {
  if (points.length === 0) {
    return { labelDays: [], labelAmounts: [] }
  }

  const labelDays: number[] = []
  const amountSet = new Set<number>([startingBalance])

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

/**
 * Drops plateau amounts that would render too close together on the y axis.
 * Months with many payment days produce clustered remaining values near zero,
 * which overlap as labels; the top and bottom of the range are always kept.
 */
export function spacedAxisAmounts(amounts: number[], yMax: number, minGapRatio: number): number[] {
  if (amounts.length <= 2 || yMax <= 0) {
    return amounts
  }

  const minGap = yMax * minGapRatio
  const highest = amounts[amounts.length - 1]
  const kept = [amounts[0]]

  for (const amount of amounts.slice(1, -1)) {
    if (amount - kept[kept.length - 1] >= minGap && highest - amount >= minGap) {
      kept.push(amount)
    }
  }

  kept.push(highest)
  return kept
}

export function dayFromAxisHighlight(
  xDays: number[],
  dataIndex: number | undefined,
): number | null {
  if (dataIndex === undefined || dataIndex < 0 || dataIndex >= xDays.length) {
    return null
  }
  const day = xDays[dataIndex]
  return day === undefined || day === MONTH_START_ANCHOR_DAY ? null : day
}
