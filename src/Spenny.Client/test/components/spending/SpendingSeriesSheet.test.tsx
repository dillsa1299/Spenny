import { render, screen } from '@testing-library/react'
import { SpendingSeriesSheet } from '@/components/spending/SpendingSeriesSheet'
import { describe, expect, it, vi } from 'vitest'

describe('SpendingSeriesSheet', () => {
  it('shows create title when open', () => {
    render(
      <SpendingSeriesSheet
        open
        mode="create"
        initial={null}
        saving={false}
        onClose={vi.fn()}
        onSave={vi.fn(async () => {})}
      />,
    )
    expect(screen.getByText('Add spending')).toBeInTheDocument()
  })

  it('defaults frequency to Monthly in create mode', () => {
    render(
      <SpendingSeriesSheet
        open
        mode="create"
        initial={null}
        saving={false}
        onClose={vi.fn()}
        onSave={vi.fn(async () => {})}
      />,
    )
    expect(screen.getByRole('combobox', { name: /frequency/i })).toHaveTextContent('Monthly')
  })

  it('defaults UK working day option on in create mode', () => {
    render(
      <SpendingSeriesSheet
        open
        mode="create"
        initial={null}
        saving={false}
        onClose={vi.fn()}
        onSave={vi.fn(async () => {})}
      />,
    )
    expect(screen.getByRole('checkbox', { name: /use previous uk working day/i })).toBeChecked()
  })
})
