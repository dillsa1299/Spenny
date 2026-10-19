// Daily burndown tooltip balances for a calendar day; aligned with API burndown steps and chart points.
import type { BurndownStepDto, SpendingOccurrenceDto } from '@/api/spendingTypes'
import { isoDateForDay } from '@/spending/burndownChartData'
import type { BurndownPoint } from '@/spending/burndownPoints'

export type BurndownDaySummary = {
  isoDate: string
  paymentCount: number
  startingBalance: number
  paymentsTotal: number
  remainingAfter: number
  payments: SpendingOccurrenceDto[]
}

export function buildBurndownDaySummary(
  year: number,
  month: number,
  day: number,
  burndownSteps: BurndownStepDto[],
  points: BurndownPoint[],
  payments: SpendingOccurrenceDto[],
): BurndownDaySummary {
  const isoDate = isoDateForDay(year, month, day)
  const step = burndownSteps.find((s) => s.effectiveDate === isoDate)
  const pointRemaining = points.find((p) => p.day === day)?.remaining

  if (step) {
    return {
      isoDate,
      paymentCount: payments.length,
      startingBalance: step.remainingAfter + step.dayTotal,
      paymentsTotal: step.dayTotal,
      remainingAfter: step.remainingAfter,
      payments,
    }
  }

  const flatRemaining = pointRemaining ?? 0
  return {
    isoDate,
    paymentCount: 0,
    startingBalance: flatRemaining,
    paymentsTotal: 0,
    remainingAfter: flatRemaining,
    payments: [],
  }
}
