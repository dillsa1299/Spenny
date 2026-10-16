import { render, screen } from '@testing-library/react'
import { ComingUpList } from '@/components/spending/ComingUpList'
import { october2026MonthFixture } from '@/test/spendingMonthFixture'
import { describe, expect, it } from 'vitest'

describe('ComingUpList', () => {
  it('renders only upcoming items', () => {
    render(
      <ComingUpList
        occurrences={october2026MonthFixture.occurrences}
        upcomingIds={october2026MonthFixture.upcomingOccurrenceIds}
        emptyMessage="None"
      />,
    )
    expect(screen.getByText('C')).toBeInTheDocument()
    expect(screen.queryByText('A')).not.toBeInTheDocument()
  })
})
