import { render, screen } from '@testing-library/react'
import { SpendingPage } from '@/pages/SpendingPage'
import { SelectedMonthProvider } from '@/month/SelectedMonthContext'
import { describe, expect, it } from 'vitest'

describe('SpendingPage', () => {
  it('shows spending heading and month selector', () => {
    render(
      <SelectedMonthProvider>
        <SpendingPage />
      </SelectedMonthProvider>,
    )
    expect(screen.getByRole('heading', { name: 'Spending' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next month' })).toBeInTheDocument()
  })
})
