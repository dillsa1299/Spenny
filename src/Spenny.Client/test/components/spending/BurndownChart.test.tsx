import { render, screen, waitFor } from '@testing-library/react'
import { BurndownChart } from '@/components/spending/BurndownChart'
import { SpendingCategory } from '@/api/spendingTypes'
import type { AxisItemIdentifier } from '@mui/x-charts/models'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const sampleOccurrences = [
  {
    id: { seriesId: '11111111-1111-1111-1111-111111111111', occurrenceDate: '2026-10-05' },
    seriesId: '11111111-1111-1111-1111-111111111111',
    occurrenceDate: '2026-10-05',
    effectiveDate: '2026-10-05',
    name: 'Rent',
    amount: 100,
    category: SpendingCategory.Bills,
    description: null,
  },
]

type LineChartStubProps = {
  onHighlightedAxisChange?: (items: AxisItemIdentifier[]) => void
  onAxisClick?: (
    event: unknown,
    data: { dataIndex: number; axisValue: number; seriesValues: Record<string, number | null> } | null,
  ) => void
  highlightedAxis?: AxisItemIdentifier[]
  tooltipAxis?: AxisItemIdentifier[]
  tooltipItem?: { seriesId: string; dataIndex: number } | null
  axisHighlight?: { x?: string }
  series?: { showMark?: (params: { index: number }) => boolean }[]
}

let latestLineChartProps: LineChartStubProps | undefined

vi.mock('@mui/x-charts/LineChart', () => ({
  LineChart: (props: LineChartStubProps & { children?: ReactNode }) => {
    latestLineChartProps = props
    return <div data-testid="line-chart-stub">{props.children}</div>
  },
}))

vi.mock('@mui/x-charts/ChartsReferenceLine', () => ({
  ChartsReferenceLine: () => null,
}))

function renderChart() {
  latestLineChartProps = undefined
  return render(
    <BurndownChart
      year={2026}
      month={10}
      monthTotal={175}
      burndownSteps={[{ effectiveDate: '2026-10-05', dayTotal: 100, remainingAfter: 75 }]}
      occurrences={sampleOccurrences}
      showTodayMarker={false}
      asOfDate="2026-10-10"
      remainingAtToday={25}
    />,
  )
}

describe('BurndownChart', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows remaining headline and accessible chart description', () => {
    renderChart()
    expect(screen.getByText('Monthly bills remaining')).toBeInTheDocument()
    expect(screen.getByText('£25.00')).toBeInTheDocument()
    expect(screen.getByText('/ £175.00')).toBeInTheDocument()
    expect(screen.getByTestId('line-chart-stub')).toBeInTheDocument()
    expect(latestLineChartProps?.highlightedAxis).toEqual([])
    expect(latestLineChartProps?.tooltipItem).toBeNull()
    expect(latestLineChartProps?.axisHighlight).toEqual({ x: 'none' })
    expect(latestLineChartProps?.tooltipAxis).toBeUndefined()
  })

  it('updates hover axis and tooltip item on highlight and clears on leave when not pinned', async () => {
    renderChart()
    const props = latestLineChartProps
    expect(props).toBeDefined()

    props!.onHighlightedAxisChange?.([{ axisId: 'burndown-x', dataIndex: 4 }])
    await waitFor(() => {
      expect(latestLineChartProps?.highlightedAxis).toEqual([{ axisId: 'burndown-x', dataIndex: 4 }])
      expect(latestLineChartProps?.tooltipItem).toEqual({ seriesId: 'remaining', dataIndex: 4 })
    })

    props!.onHighlightedAxisChange?.([])
    await waitFor(() => {
      expect(latestLineChartProps?.highlightedAxis).toEqual([])
      expect(latestLineChartProps?.tooltipItem).toBeNull()
    })
  })

  it('pins selection on axis click and ignores highlight clear while pinned', async () => {
    renderChart()
    const props = latestLineChartProps

    props!.onAxisClick?.(null, { dataIndex: 4, axisValue: 4, seriesValues: {} })
    await waitFor(() => {
      expect(latestLineChartProps?.highlightedAxis).toEqual([{ axisId: 'burndown-x', dataIndex: 4 }])
      expect(latestLineChartProps?.tooltipItem).toEqual({ seriesId: 'remaining', dataIndex: 4 })
    })

    props!.onHighlightedAxisChange?.([])
    await waitFor(() => {
      expect(latestLineChartProps?.highlightedAxis).toEqual([{ axisId: 'burndown-x', dataIndex: 4 }])
      expect(latestLineChartProps?.tooltipItem).toEqual({ seriesId: 'remaining', dataIndex: 4 })
    })
  })

  it('keeps pin fixed when axis highlight moves without pointer down on chart', async () => {
    renderChart()
    latestLineChartProps!.onAxisClick?.(null, { dataIndex: 4, axisValue: 4, seriesValues: {} })
    await waitFor(() => {
      expect(latestLineChartProps?.tooltipItem).toEqual({ seriesId: 'remaining', dataIndex: 4 })
    })

    latestLineChartProps!.onHighlightedAxisChange?.([{ axisId: 'burndown-x', dataIndex: 5 }])
    await waitFor(() => {
      expect(latestLineChartProps?.highlightedAxis).toEqual([{ axisId: 'burndown-x', dataIndex: 4 }])
      expect(latestLineChartProps?.tooltipItem).toEqual({ seriesId: 'remaining', dataIndex: 4 })
    })
  })

  it('scrubs pinned selection when axis highlight moves while pointer is down on chart', async () => {
    renderChart()
    latestLineChartProps!.onAxisClick?.(null, { dataIndex: 4, axisValue: 4, seriesValues: {} })
    await waitFor(() => {
      expect(latestLineChartProps?.tooltipItem).toEqual({ seriesId: 'remaining', dataIndex: 4 })
    })

    const chartArea = screen.getByTestId('burndown-chart-area')
    const plotSurface = document.createElement('div')
    plotSurface.addEventListener('pointerdown', (event) => {
      event.stopPropagation()
    })
    chartArea.appendChild(plotSurface)

    plotSurface.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    latestLineChartProps!.onHighlightedAxisChange?.([{ axisId: 'burndown-x', dataIndex: 5 }])
    await waitFor(() => {
      expect(latestLineChartProps?.highlightedAxis).toEqual([{ axisId: 'burndown-x', dataIndex: 5 }])
      expect(latestLineChartProps?.tooltipItem).toEqual({ seriesId: 'remaining', dataIndex: 5 })
    })
  })

  it('clears pin on outside pointerdown', async () => {
    renderChart()
    latestLineChartProps!.onAxisClick?.(null, { dataIndex: 4, axisValue: 4, seriesValues: {} })
    await waitFor(() => {
      expect(latestLineChartProps?.highlightedAxis).toEqual([{ axisId: 'burndown-x', dataIndex: 4 }])
    })

    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    await waitFor(() => {
      expect(latestLineChartProps?.highlightedAxis).toEqual([])
      expect(latestLineChartProps?.tooltipItem).toBeNull()
    })
  })

  it('shows mark only for hover index until pinned', async () => {
    renderChart()
    latestLineChartProps!.onHighlightedAxisChange?.([{ axisId: 'burndown-x', dataIndex: 3 }])
    await waitFor(() => {
      const showMark = latestLineChartProps?.series?.[0]?.showMark
      expect(showMark?.({ index: 3 })).toBe(true)
      expect(showMark?.({ index: 2 })).toBe(false)
    })

    latestLineChartProps!.onAxisClick?.(null, { dataIndex: 5, axisValue: 5, seriesValues: {} })
    await waitFor(() => {
      const showMark = latestLineChartProps?.series?.[0]?.showMark
      expect(showMark?.({ index: 5 })).toBe(true)
      expect(showMark?.({ index: 3 })).toBe(false)
    })
  })
})
