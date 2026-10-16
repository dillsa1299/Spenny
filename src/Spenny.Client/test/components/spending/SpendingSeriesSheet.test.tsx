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
})
