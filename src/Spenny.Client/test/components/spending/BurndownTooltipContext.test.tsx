import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  BurndownTooltipProvider,
  useBurndownTooltipContext,
} from '@/components/spending/BurndownTooltipContext'

function Reader() {
  const ctx = useBurndownTooltipContext()
  return <span>{ctx.year}</span>
}

describe('BurndownTooltipContext', () => {
  it('provides year to descendants', () => {
    render(
      <BurndownTooltipProvider value={{ year: 2026, month: 10, occurrencesByDay: new Map() }}>
        <Reader />
      </BurndownTooltipProvider>,
    )
    expect(screen.getByText('2026')).toBeInTheDocument()
  })
})
