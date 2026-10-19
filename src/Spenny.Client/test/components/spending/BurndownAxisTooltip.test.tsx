import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BurndownAxisTooltip } from '@/components/spending/BurndownAxisTooltip'
import { BurndownTooltipProvider } from '@/components/spending/BurndownTooltipContext'
import { SpendingCategory } from '@/api/spendingTypes'

vi.mock('@mui/x-charts/ChartsTooltip', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mui/x-charts/ChartsTooltip')>()
  return {
    ...actual,
    useAxesTooltip: () => [
      {
        axisDirection: 'x',
        axisId: 'burndown-x',
        dataIndex: 4,
        axisValue: 5,
        axisFormattedValue: '5',
        seriesItems: [],
        mainAxis: {} as never,
      },
    ],
    ChartsTooltipContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  }
})

describe('BurndownAxisTooltip', () => {
  it('shows payments for the highlighted axis day', () => {
    render(
      <BurndownTooltipProvider
        value={{
          year: 2026,
          month: 10,
          occurrencesByDay: new Map([
            [
              5,
              [
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
              ],
            ],
          ]),
        }}
      >
        <BurndownAxisTooltip />
      </BurndownTooltipProvider>,
    )
    expect(screen.getByText('Rent')).toBeInTheDocument()
  })
})
