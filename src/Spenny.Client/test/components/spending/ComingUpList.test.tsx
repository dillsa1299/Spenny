import { render, screen } from '@testing-library/react'
import { ComingUpList } from '@/components/spending/ComingUpList'
import { october2026MonthFixture } from '@/test/spendingMonthFixture'
import { describe, expect, it } from 'vitest'

describe('ComingUpList', () => {
  it('renders upcoming items in API order', () => {
    render(
      <ComingUpList
        occurrences={october2026MonthFixture.occurrences}
        upcomingIds={october2026MonthFixture.upcomingOccurrenceIds}
        emptyMessage="None"
      />,
    )
    const rows = screen.getAllByRole('listitem')
    expect(rows).toHaveLength(october2026MonthFixture.upcomingOccurrenceIds.length)
    expect(rows[0]).toHaveTextContent('20th · C · Transport')
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
})
