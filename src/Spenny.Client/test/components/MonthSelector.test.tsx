import { render, screen } from '@testing-library/react'
import { MonthSelector } from '@/components/MonthSelector'
import { SelectedMonthProvider } from '@/month/SelectedMonthContext'
import { describe, expect, it } from 'vitest'

describe('MonthSelector', () => {
  it('shows prev/next month controls', () => {
    render(
      <SelectedMonthProvider>
        <MonthSelector />
      </SelectedMonthProvider>,
    )

    expect(screen.getByRole('button', { name: 'Previous month' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next month' })).toBeInTheDocument()
  })
})
