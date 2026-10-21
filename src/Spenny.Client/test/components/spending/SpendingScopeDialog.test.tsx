import { render, screen } from '@testing-library/react'
import { SpendingScopeDialog } from '@/components/spending/SpendingScopeDialog'
import { describe, expect, it, vi } from 'vitest'

describe('SpendingScopeDialog', () => {
  it('offers this date vs entire series', () => {
    render(
      <SpendingScopeDialog
        open
        onClose={vi.fn()}
        onThisOccurrence={vi.fn()}
        onEntireSeries={vi.fn()}
      />,
    )
    expect(screen.getByRole('dialog', { name: 'Edit spending' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'This date only' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Entire series' })).toBeInTheDocument()
  })
})
