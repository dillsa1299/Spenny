import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BurndownLineMark } from '@/components/spending/BurndownLineMark'
import { BurndownTooltipProvider } from '@/components/spending/BurndownTooltipContext'

function renderMark(pinnedDataIndex: number | null, dataIndex: number) {
  const { container } = render(
    <BurndownTooltipProvider
      value={{
        year: 2026,
        month: 10,
        xDays: [0, 1, 2, 3, 4, 5],
        pinnedDataIndex,
        burndownSteps: [],
        points: [],
        occurrencesByDay: new Map(),
      }}
    >
      <svg>
        <BurndownLineMark
          seriesId="remaining"
          dataIndex={dataIndex}
          x={10}
          y={20}
          color="#e76f51"
          shape="circle"
          hidden={false}
        />
      </svg>
    </BurndownTooltipProvider>,
  )
  return container.querySelector('svg')
}

describe('BurndownLineMark', () => {
  it('renders one hollow ring on hover', () => {
    const svg = renderMark(null, 3)
    expect(svg?.querySelectorAll('circle')).toHaveLength(1)
    expect(svg?.querySelector('circle')?.getAttribute('r')).toBe('6')
  })

  it('renders ring plus white center when pinned at this index', () => {
    const svg = renderMark(5, 5)
    const circles = svg?.querySelectorAll('circle') ?? []
    expect(circles).toHaveLength(2)
    expect(circles[1]?.getAttribute('r')).toBe('2.5')
    expect(circles[1]?.getAttribute('fill')).toBe('#ffffff')
  })
})
