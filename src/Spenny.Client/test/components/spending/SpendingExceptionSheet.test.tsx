import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

function renderExceptionSheet() {
  return render(
    <SpendingExceptionSheet
      open
      occurrence={sampleOccurrence}
      saving={false}
      onClose={vi.fn()}
      onSave={vi.fn()}
    />,
  )
}

describe('SpendingExceptionSheet', () => {
  it('shows edit-this-date title when open', () => {
    renderExceptionSheet()
    expect(screen.getByText('Edit this date')).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toHaveValue('Cleaner')
  })

  it('accepts digits and a decimal in the amount field', async () => {
    const user = userEvent.setup()
    renderExceptionSheet()
    const amount = screen.getByLabelText('Amount (£)')

    await user.clear(amount)
    await user.type(amount, '12.50')

    expect(amount).toHaveValue('12.50')
  })

  it('strips letters from the amount field', async () => {
    const user = userEvent.setup()
    renderExceptionSheet()
    const amount = screen.getByLabelText('Amount (£)')

    await user.clear(amount)
    await user.type(amount, '12ab')

    expect(amount).toHaveValue('12')
  })

  it('sanitises pasted mixed amount content', async () => {
    const user = userEvent.setup()
    renderExceptionSheet()
    const amount = screen.getByLabelText('Amount (£)')

    await user.clear(amount)
    await user.click(amount)
    await user.paste('abc12.5xyz')

    expect(amount).toHaveValue('12.5')
  })
})
