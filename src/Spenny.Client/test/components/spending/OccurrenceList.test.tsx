import { render, screen } from '@testing-library/react'
import { OccurrenceList } from '@/components/spending/OccurrenceList'
import { SpendingCategory, SpendingFrequency } from '@/api/spendingTypes'
import { october2026MonthFixture } from '@/test/spendingMonthFixture'
import { describe, expect, it, vi } from 'vitest'

const seriesA = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'A',
  amount: 100,
  anchorDate: '2026-10-05',
  frequency: SpendingFrequency.Monthly,
  category: SpendingCategory.General,
  roundWeekendToFriday: false,
  description: null,
}

describe('OccurrenceList', () => {
  it('groups occurrences under one header per date', () => {
    render(
      <OccurrenceList
        occurrences={october2026MonthFixture.occurrences}
        series={[seriesA]}
        emptyMessage="Empty"
        onSelect={vi.fn()}
      />,
    )
    expect(screen.getByText('5th October')).toBeInTheDocument()
    expect(screen.getByText('20th October')).toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(3)
  })

  it('shows frequency and category, falling back to category when the series is unknown', () => {
    render(
      <OccurrenceList
        occurrences={october2026MonthFixture.occurrences}
        series={[seriesA]}
        emptyMessage="Empty"
        onSelect={vi.fn()}
      />,
    )
    expect(screen.getByText('Monthly · General')).toBeInTheDocument()
    expect(screen.getByText('Bills')).toBeInTheDocument()
  })

  it('shows description inline with name when set', () => {
    const withDescription = {
      ...october2026MonthFixture.occurrences[0],
      description: 'Netflix family plan',
    }
    render(
      <OccurrenceList
        occurrences={[withDescription]}
        series={[seriesA]}
        emptyMessage="Empty"
        onSelect={vi.fn()}
      />,
    )
    expect(screen.getByText('- Netflix family plan')).toBeInTheDocument()
    expect(screen.getByText('Monthly · General')).toBeInTheDocument()
  })

  it('omits description when empty', () => {
    render(
      <OccurrenceList
        occurrences={[october2026MonthFixture.occurrences[0]]}
        series={[seriesA]}
        emptyMessage="Empty"
        onSelect={vi.fn()}
      />,
    )
    expect(screen.queryByText(/Netflix family plan/)).not.toBeInTheDocument()
    expect(screen.getByText('Monthly · General')).toBeInTheDocument()
  })
})
