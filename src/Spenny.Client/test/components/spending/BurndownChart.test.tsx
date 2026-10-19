import { render, screen } from '@testing-library/react'
import { BurndownChart } from '@/components/spending/BurndownChart'
import { SpendingCategory } from '@/api/spendingTypes'
import { describe, expect, it } from 'vitest'

const sampleOccurrences = [
  {
    id: { seriesId: '11111111-1111-1111-1111-111111111111', occurrenceDate: '2026-10-05' },
    seriesId: '11111111-1111-1111-1111-111111111111',
    occurrenceDate: '2026-10-05',
    effectiveDate: '2026-10-05',
    name: 'Rent',
    amount: 100,
    category: SpendingCategory.Bills,
    description: null,
  },
]

describe('BurndownChart', () => {
  it('shows remaining headline and accessible chart description', () => {
    render(
      <BurndownChart
        year={2026}
        month={10}
        monthTotal={175}
        burndownSteps={[{ effectiveDate: '2026-10-05', dayTotal: 100, remainingAfter: 75 }]}
        occurrences={sampleOccurrences}
        showTodayMarker={false}
        asOfDate="2026-10-10"
        remainingAtToday={25}
      />,
    )
    expect(screen.getByText(/£25\.00 \/ £175\.00/, { exact: false })).toBeInTheDocument()
    expect(screen.getByText('remaining')).toBeInTheDocument()
    expect(document.querySelector('svg')).toBeTruthy()
  })
})
