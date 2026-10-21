import { render, screen } from '@testing-library/react'
import { SpendingExceptionSheet } from '@/components/spending/SpendingExceptionSheet'
import { SpendingCategory } from '@/api/spendingTypes'
import { describe, expect, it, vi } from 'vitest'

const sampleOccurrence = {
  id: { seriesId: 'a', occurrenceDate: '2026-10-05' },
  seriesId: 'a',
  occurrenceDate: '2026-10-05',
  effectiveDate: '2026-10-05',
  name: 'Cleaner',
  amount: 50,
  category: SpendingCategory.Bills,
  description: null,
}

describe('SpendingExceptionSheet', () => {
  it('shows edit-this-date title when open', () => {
    render(
      <SpendingExceptionSheet
        open
        occurrence={sampleOccurrence}
        saving={false}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />,
    )
    expect(screen.getByText('Edit this date')).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toHaveValue('Cleaner')
  })
})
