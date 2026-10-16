// Step-chart points for the month burndown (day index 1..daysInMonth).
import type { BurndownStepDto } from '@/api/spendingTypes'

export type BurndownPoint = {
  day: number
  remaining: number
}

export function buildBurndownPoints(
  year: number,
  month: number,
  monthTotal: number,
  steps: BurndownStepDto[],
): BurndownPoint[] {
  const daysInMonth = new Date(year, month, 0).getDate()
  const remainingAfterByDay = new Map<number, number>()
  for (const step of steps) {
    remainingAfterByDay.set(dayFromIsoDate(step.effectiveDate), step.remainingAfter)
  }

  const points: BurndownPoint[] = []
  let remaining = monthTotal
  for (let day = 1; day <= daysInMonth; day += 1) {
    if (remainingAfterByDay.has(day)) {
      remaining = remainingAfterByDay.get(day)!
    }
    points.push({ day, remaining })
  }
  return points
}

export function dayFromIsoDate(isoDate: string): number {
  return Number(isoDate.slice(8, 10))
}
