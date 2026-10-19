import { SpendingCategory } from '@/api/spendingTypes'
import { buildBurndownDaySummary } from '@/spending/burndownDaySummary'
import { buildBurndownPoints } from '@/spending/burndownPoints'
import { describe, expect, it } from 'vitest'

const payment = (name: string, amount: number, effectiveDate: string) => ({
  id: { seriesId: name, occurrenceDate: effectiveDate },
  seriesId: name,
  occurrenceDate: effectiveDate,
  effectiveDate,
  name,
  amount,
  category: SpendingCategory.Bills,
  description: null,
})

describe('buildBurndownDaySummary', () => {
  const steps = [
    { effectiveDate: '2026-10-05', dayTotal: 150, remainingAfter: 25 },
    { effectiveDate: '2026-10-20', dayTotal: 25, remainingAfter: 0 },
  ]
  const points = buildBurndownPoints(2026, 10, 175, steps)

  it('summarises a multi-payment day from burndown step totals', () => {
    const payments = [payment('Third Payment', 100, '2026-10-05'), payment('Fourth Payment', 50, '2026-10-05')]
    const summary = buildBurndownDaySummary(2026, 10, 5, steps, points, payments)
    expect(summary.paymentCount).toBe(2)
    expect(summary.startingBalance).toBe(175)
    expect(summary.paymentsTotal).toBe(150)
    expect(summary.remainingAfter).toBe(25)
    expect(summary.remainingAfter).toBe(points[4].remaining)
    expect(payments.reduce((s, p) => s + p.amount, 0)).toBe(summary.paymentsTotal)
  })

  it('summarises a single-payment day', () => {
    const payments = [payment('Bill', 25, '2026-10-20')]
    const summary = buildBurndownDaySummary(2026, 10, 20, steps, points, payments)
    expect(summary.startingBalance).toBe(25)
    expect(summary.paymentsTotal).toBe(25)
    expect(summary.remainingAfter).toBe(0)
  })

  it('summarises a day with no payments as flat remaining', () => {
    const summary = buildBurndownDaySummary(2026, 10, 10, steps, points, [])
    expect(summary.paymentCount).toBe(0)
    expect(summary.paymentsTotal).toBe(0)
    expect(summary.startingBalance).toBe(25)
    expect(summary.remainingAfter).toBe(25)
    expect(summary.remainingAfter).toBe(points[9].remaining)
  })
})
