import { render, screen } from '@testing-library/react'
import { BurndownChart } from '@/components/spending/BurndownChart'
import { describe, expect, it } from 'vitest'

describe('BurndownChart', () => {
  it('exposes an accessible chart label', () => {
    render(
      <BurndownChart
        year={2026}
        month={10}
        monthTotal={100}
        burndownSteps={[]}
        showTodayMarker={false}
        asOfDate="2026-10-10"
        remainingAtToday={100}
      />,
    )
    expect(screen.getByRole('img')).toHaveAccessibleName(/Burndown/)
  })
})
