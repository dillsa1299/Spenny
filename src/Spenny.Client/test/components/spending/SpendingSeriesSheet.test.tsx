import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SpendingSeriesSheet } from '@/components/spending/SpendingSeriesSheet'
import { describe, expect, it, vi } from 'vitest'

function renderCreateSheet() {
  return render(
    <SpendingSeriesSheet
      open
      mode="create"
      initial={null}
      saving={false}
      onClose={vi.fn()}
      onSave={vi.fn(async () => {})}
    />,
  )
}

describe('SpendingSeriesSheet', () => {
  it('shows create title when open', () => {
    renderCreateSheet()
    expect(screen.getByText('Add spending')).toBeInTheDocument()
  })

  it('defaults frequency to Monthly in create mode', () => {
    renderCreateSheet()
    expect(screen.getByRole('combobox', { name: /frequency/i })).toHaveTextContent('Monthly')
  })

  it('defaults UK working day option on in create mode', () => {
    renderCreateSheet()
    expect(screen.getByRole('checkbox', { name: /use next uk working day/i })).toBeChecked()
  })

  it('accepts digits and a decimal in the amount field', async () => {
    const user = userEvent.setup()
    renderCreateSheet()
    const amount = screen.getByLabelText('Amount (£)')

    await user.type(amount, '12.50')

    expect(amount).toHaveValue('12.50')
  })

  it('strips letters from the amount field', async () => {
    const user = userEvent.setup()
    renderCreateSheet()
    const amount = screen.getByLabelText('Amount (£)')

    await user.type(amount, '12ab')

    expect(amount).toHaveValue('12')
  })

  it('sanitises pasted mixed amount content', async () => {
    const user = userEvent.setup()
    renderCreateSheet()
    const amount = screen.getByLabelText('Amount (£)')

    await user.click(amount)
    await user.paste('abc12.5xyz')

    expect(amount).toHaveValue('12.5')
  })
})
