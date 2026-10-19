import { render, screen } from '@testing-library/react'
import { BurndownDayTooltipContent } from '@/components/spending/BurndownDayTooltipContent'
import { SpendingCategory } from '@/api/spendingTypes'
import type { BurndownDaySummary } from '@/spending/burndownDaySummary'
import { describe, expect, it } from 'vitest'

const multiPaymentSummary: BurndownDaySummary = {
  isoDate: '2026-10-05',
  paymentCount: 2,
  startingBalance: 250,
  paymentsTotal: 150,
  remainingAfter: 100,
  payments: [
    {
      id: { seriesId: 'a', occurrenceDate: '2026-10-05' },
      seriesId: 'a',
      occurrenceDate: '2026-10-05',
      effectiveDate: '2026-10-05',
      name: 'Third Payment',
      amount: 100,
      category: SpendingCategory.Bills,
      description: null,
    },
    {
      id: { seriesId: 'b', occurrenceDate: '2026-10-05' },
      seriesId: 'b',
      occurrenceDate: '2026-10-05',
      effectiveDate: '2026-10-05',
      name: 'Fourth Payment',
      amount: 50,
      category: SpendingCategory.Bills,
      description: null,
    },
  ],
}

describe('BurndownDayTooltipContent', () => {
  it('shows daily summary and payment list', () => {
    render(<BurndownDayTooltipContent summary={multiPaymentSummary} />)
    expect(screen.getByText('5th October')).toBeInTheDocument()
    expect(screen.getByText('2 payments')).toBeInTheDocument()
    expect(screen.getByText('Starting balance')).toBeInTheDocument()
    expect(screen.getByText('£250.00')).toBeInTheDocument()
    expect(screen.getByText('\u2212£150.00')).toBeInTheDocument()
    expect(screen.getByText('Remaining afterwards')).toBeInTheDocument()
    expect(screen.getByText('£100.00')).toBeInTheDocument()
    expect(screen.getByText('Third Payment · £100.00')).toBeInTheDocument()
    expect(screen.getByText('Fourth Payment · £50.00')).toBeInTheDocument()
  })

  it('uses singular payment label', () => {
    render(
      <BurndownDayTooltipContent
        summary={{
          ...multiPaymentSummary,
          paymentCount: 1,
          payments: [multiPaymentSummary.payments[0]],
        }}
      />,
    )
    expect(screen.getByText('1 payment')).toBeInTheDocument()
  })
})
