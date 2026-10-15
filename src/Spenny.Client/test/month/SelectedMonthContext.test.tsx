import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SelectedMonthProvider, useSelectedMonth } from '@/month/SelectedMonthContext'
import { describe, expect, it } from 'vitest'

function MonthProbe() {
  const { selectedMonth, goToNextMonth } = useSelectedMonth()
  return (
    <div>
      <p>{selectedMonth.year}-{selectedMonth.month}</p>
      <button type="button" onClick={goToNextMonth}>Next</button>
    </div>
  )
}

describe('SelectedMonthContext', () => {
  it('advances the selected month', async () => {
    const user = userEvent.setup()
    render(
      <SelectedMonthProvider>
        <MonthProbe />
      </SelectedMonthProvider>,
    )

    const before = screen.getByText(/\d{4}-\d{1,2}/).textContent
    await user.click(screen.getByRole('button', { name: 'Next' }))
    const after = screen.getByText(/\d{4}-\d{1,2}/).textContent
    expect(after).not.toBe(before)
  })
})
