import { render, screen } from '@testing-library/react'
import { ComingUpList } from '@/components/spending/ComingUpList'
import { formatCalendarDay } from '@/lib/formatCalendarDay'
import { october2026MonthFixture } from '@/test/spendingMonthFixture'
import { describe, expect, it } from 'vitest'

describe('ComingUpList', () => {
  it('renders upcoming items in API order under date headers', () => {
    render(
      <ComingUpList
        occurrences={october2026MonthFixture.occurrences}
        upcomingIds={october2026MonthFixture.upcomingOccurrenceIds}
        emptyMessage="None"
      />,
    )
    const rows = screen.getAllByRole('listitem')
    expect(rows).toHaveLength(october2026MonthFixture.upcomingOccurrenceIds.length)
    expect(screen.getByText('20th October')).toBeInTheDocument()
    expect(rows[0]).toHaveTextContent('C')
    expect(rows[0]).toHaveTextContent('Transport')
    expect(rows[0]).toHaveTextContent('£25.00')
  })

  it('follows upcomingIds order not occurrences array order', () => {
    const first = october2026MonthFixture.occurrences[0]
    const second = october2026MonthFixture.occurrences[1]
    render(
      <ComingUpList
        occurrences={[second, first]}
        upcomingIds={[first.id, second.id]}
        emptyMessage="None"
      />,
    )
    const rows = screen.getAllByRole('listitem')
    expect(rows[0]).toHaveTextContent(first.name)
    expect(rows[1]).toHaveTextContent(second.name)
  })

  it('groups multiple payments on the same date under one header', () => {
    const first = october2026MonthFixture.occurrences[0]
    const second = october2026MonthFixture.occurrences[1]
    const sameDay = { ...second, effectiveDate: first.effectiveDate }
    render(
      <ComingUpList
        occurrences={[first, sameDay]}
        upcomingIds={[first.id, sameDay.id]}
        emptyMessage="None"
      />,
    )
    expect(screen.getAllByText(formatCalendarDay(first.effectiveDate))).toHaveLength(1)
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })
})
