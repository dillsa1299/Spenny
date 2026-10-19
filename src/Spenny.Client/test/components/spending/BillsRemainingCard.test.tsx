// Verifies the dashboard remaining card derives paid amount and percentage from remaining vs month total.
import { render, screen } from '@testing-library/react'
import { BillsRemainingCard } from '@/components/spending/BillsRemainingCard'
import { describe, expect, it } from 'vitest'

describe('BillsRemainingCard', () => {
  it('shows remaining, total, paid amount and percentage', () => {
    render(<BillsRemainingCard remaining={100} monthTotal={450} />)
    expect(screen.getByText('£100.00')).toBeInTheDocument()
    expect(screen.getByText('/ £450.00')).toBeInTheDocument()
    expect(screen.getByText('£350.00 paid')).toBeInTheDocument()
    expect(screen.getByText('77.8% paid')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Paid this month' })).toHaveAttribute(
      'aria-valuenow',
      '78',
    )
  })

  it('shows 0% paid for an empty month', () => {
    render(<BillsRemainingCard remaining={0} monthTotal={0} />)
    expect(screen.getByText('0.0% paid')).toBeInTheDocument()
  })
})
