import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BurndownItemTooltip } from '@/components/spending/BurndownItemTooltip'
import { BurndownTooltipProvider } from '@/components/spending/BurndownTooltipContext'
import { SpendingCategory } from '@/api/spendingTypes'
import { MONTH_START_ANCHOR_DAY } from '@/spending/burndownChartData'

vi.mock('@mui/x-charts/ChartsTooltip', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mui/x-charts/ChartsTooltip')>()
  return {
    ...actual,
    useItemTooltip: () => ({
      identifier: { type: 'line', seriesId: 'remaining', dataIndex: 5 },
      color: '#888',
      label: 'Remaining',
      value: 75,
      formattedValue: '£75.00',
      markType: 'circle',
    }),
    ChartsTooltipContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  }
})

const xDays = [MONTH_START_ANCHOR_DAY, ...Array.from({ length: 31 }, (_, i) => i + 1)]

describe('BurndownItemTooltip', () => {
  it('shows payments for the highlighted item day', () => {
    render(
      <BurndownTooltipProvider
        value={{
          year: 2026,
          month: 10,
          xDays,
          pinnedDataIndex: 5,
          burndownSteps: [{ effectiveDate: '2026-10-05', dayTotal: 100, remainingAfter: 75 }],
          points: Array.from({ length: 31 }, (_, i) => ({
            day: i + 1,
            remaining: i + 1 < 5 ? 175 : 75,
          })),
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
        <BurndownItemTooltip />
      </BurndownTooltipProvider>,
    )
    expect(screen.getByText('Rent · £100.00')).toBeInTheDocument()
    expect(screen.getByText('Starting balance')).toBeInTheDocument()
  })
})
