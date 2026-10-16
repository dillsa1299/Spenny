import { render, screen } from '@testing-library/react'
import { OccurrenceList } from '@/components/spending/OccurrenceList'
import { october2026MonthFixture } from '@/test/spendingMonthFixture'
import { describe, expect, it, vi } from 'vitest'

describe('OccurrenceList', () => {
  it('lists occurrences', () => {
    render(
      <OccurrenceList
        occurrences={october2026MonthFixture.occurrences}
        emptyMessage="Empty"
        onSelect={vi.fn()}
      />,
    )
    expect(screen.getByText('A')).toBeInTheDocument()
  })
})
