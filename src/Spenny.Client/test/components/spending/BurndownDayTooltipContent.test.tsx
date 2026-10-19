import { render, screen } from '@testing-library/react'
import { BurndownDayTooltipContent } from '@/components/spending/BurndownDayTooltipContent'
import { SpendingCategory } from '@/api/spendingTypes'
import { describe, expect, it } from 'vitest'

describe('BurndownDayTooltipContent', () => {
  it('lists payments for the day', () => {
    render(
      <BurndownDayTooltipContent
        isoDate="2026-10-05"
        payments={[
          {
            id: { seriesId: 'a', occurrenceDate: '2026-10-05' },
            seriesId: 'a',
            occurrenceDate: '2026-10-05',
            effectiveDate: '2026-10-05',
            name: 'Rent',
            amount: 100,
            category: SpendingCategory.Bills,
            description: null,
          },
        ]}
      />,
    )
    expect(screen.getByText('Rent')).toBeInTheDocument()
    expect(screen.getByText(/£100\.00/)).toBeInTheDocument()
  })
})
