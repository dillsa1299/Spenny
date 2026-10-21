// Month burndown via MUI X LineChart; hover previews a day, click/tap pins tooltip until dismiss.
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { ChartsReferenceLine } from '@mui/x-charts/ChartsReferenceLine'
import { LineChart } from '@mui/x-charts/LineChart'
import type { LineChartSlots } from '@mui/x-charts/LineChart'
import type { AxisItemIdentifier, ChartsAxisData } from '@mui/x-charts/models'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { BurndownStepDto, SpendingOccurrenceDto } from '@/api/spendingTypes'
import { BillsRemainingCard } from '@/components/spending/BillsRemainingCard'
import { BurndownItemTooltip } from '@/components/spending/BurndownItemTooltip'
import { BurndownLineMark } from '@/components/spending/BurndownLineMark'
import { BurndownTooltipProvider } from '@/components/spending/BurndownTooltipContext'
import { dayFromIsoDate } from '@/spending/burndownPoints'
import {
  buildBurndownLineChartData,
  burndownAxisMarkers,
  isoDateForDay,
  spacedAxisAmounts,
} from '@/spending/burndownChartData'
import {
  emptyBurndownSelection,
  resolveBurndownAxisClick,
  resolveBurndownAxisSelection,
  shouldIgnoreAxisHighlightClear,
  type BurndownAxisSelection,
} from '@/spending/burndownChartSelection'
import { occurrencesByDay } from '@/spending/occurrencesByDay'
import { formatGbp } from '@/lib/formatGbp'
import { formatOrdinalDay } from '@/lib/formatOrdinalDay'

type BurndownChartProps = {
  year: number
  month: number
  monthTotal: number
  burndownSteps: BurndownStepDto[]
  occurrences: SpendingOccurrenceDto[]
  showTodayMarker: boolean
  asOfDate: string
  remainingAtToday: number
}

const CHART_HEIGHT = 220

/** Smallest vertical gap between y labels, as a fraction of the month total, so 10px text does not collide. */
const Y_LABEL_MIN_GAP_RATIO = 0.1

export function BurndownChart({
  year,
  month,
  monthTotal,
  burndownSteps,
  occurrences,
  showTodayMarker,
  asOfDate,
  remainingAtToday,
}: BurndownChartProps) {
  const theme = useTheme()
  const chartAreaRef = useRef<HTMLDivElement>(null)
  const chartScrubActiveRef = useRef(false)
  const [activeDay, setActiveDay] = useState<number | null>(null)
  const [liveAxis, setLiveAxis] = useState<AxisItemIdentifier[]>([])
  const [pinnedSelection, setPinnedSelection] = useState<BurndownAxisSelection | null>(null)
  const [hoverDataIndex, setHoverDataIndex] = useState<number | null>(null)

  const chartData = useMemo(
    () => buildBurndownLineChartData(year, month, monthTotal, burndownSteps),
    [year, month, monthTotal, burndownSteps],
  )
  const byDay = useMemo(() => occurrencesByDay(occurrences), [occurrences])

  const todayDay = showTodayMarker ? dayFromIsoDate(asOfDate) : null

  const pinnedDataIndex = pinnedSelection?.dataIndex ?? null

  const chartAxis = pinnedSelection?.highlightedAxis ?? liveAxis

  const activeDataIndex = pinnedDataIndex ?? hoverDataIndex
  const tooltipItem =
    activeDataIndex !== null ? { seriesId: 'remaining' as const, dataIndex: activeDataIndex } : null

  const displayedRemaining = useMemo(() => {
    if (activeDay === null) {
      return remainingAtToday
    }
    return chartData.points.find((p) => p.day === activeDay)?.remaining ?? remainingAtToday
  }, [activeDay, chartData.points, remainingAtToday])

  const label =
    monthTotal === 0
      ? 'No scheduled spending this month'
      : `${formatGbp(displayedRemaining)} of ${formatGbp(monthTotal)} remaining`

  const applyPin = useCallback((selection: BurndownAxisSelection) => {
    setHoverDataIndex(null)
    setLiveAxis([])
    setPinnedSelection(selection)
    setActiveDay(selection.day)
  }, [])

  const clearSelection = useCallback(() => {
    const cleared = emptyBurndownSelection()
    setActiveDay(cleared.activeDay)
    setLiveAxis(cleared.liveAxis)
    setPinnedSelection(cleared.pinnedSelection)
    setHoverDataIndex(cleared.hoverDataIndex)
  }, [])

  const onHighlightedAxisChange = (axisItems: AxisItemIdentifier[]) => {
    if (shouldIgnoreAxisHighlightClear(pinnedSelection !== null, axisItems)) {
      return
    }

    const selection = resolveBurndownAxisSelection(axisItems, chartData.xDays)

    if (pinnedSelection !== null) {
      if (selection !== null && chartScrubActiveRef.current) {
        setPinnedSelection(selection)
        setActiveDay(selection.day)
      }
      return
    }

    if (selection === null) {
      setLiveAxis([])
      setHoverDataIndex(null)
      setActiveDay(null)
      return
    }

    setLiveAxis(selection.highlightedAxis)
    setHoverDataIndex(selection.dataIndex)
    setActiveDay(selection.day)
  }

  const onAxisClick = (_event: unknown, data: ChartsAxisData | null) => {
    if (data === null) {
      return
    }
    const selection = resolveBurndownAxisClick(data.dataIndex, chartData.xDays)
    if (selection === null) {
      return
    }
    applyPin(selection)
  }

  const beginChartScrub = useCallback(() => {
    chartScrubActiveRef.current = true
  }, [])

  const endChartScrub = useCallback(() => {
    chartScrubActiveRef.current = false
  }, [])

  useEffect(() => {
    window.addEventListener('pointerup', endChartScrub)
    window.addEventListener('pointercancel', endChartScrub)
    return () => {
      window.removeEventListener('pointerup', endChartScrub)
      window.removeEventListener('pointercancel', endChartScrub)
      chartScrubActiveRef.current = false
    }
  }, [endChartScrub])

  useEffect(() => {
    if (pinnedSelection === null) {
      return undefined
    }

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Node)) {
        return
      }
      if (chartAreaRef.current?.contains(target)) {
        return
      }
      if (target instanceof Element && target.closest('[data-burndown-axis-tooltip]')) {
        return
      }
      clearSelection()
    }

    document.addEventListener('pointerdown', onPointerDown, true)
    return () => document.removeEventListener('pointerdown', onPointerDown, true)
  }, [pinnedSelection, clearSelection])

  const yMax = Math.max(monthTotal, 1)
  const lineColor = theme.palette.secondary.main
  const axisMarkers = useMemo(
    () => burndownAxisMarkers(chartData.points, monthTotal),
    [chartData.points, monthTotal],
  )
  const xTickValues = axisMarkers.labelDays.length > 0 ? axisMarkers.labelDays : [1]
  const yTickValues = useMemo(
    () =>
      axisMarkers.labelAmounts.length > 0
        ? spacedAxisAmounts(axisMarkers.labelAmounts, yMax, Y_LABEL_MIN_GAP_RATIO)
        : [0, yMax],
    [axisMarkers.labelAmounts, yMax],
  )

  return (
    <Box sx={{ width: '100%', minWidth: 0, position: 'relative' }}>
      <BillsRemainingCard remaining={displayedRemaining} monthTotal={monthTotal} />

      <BurndownTooltipProvider
        value={{
          year,
          month,
          xDays: chartData.xDays,
          pinnedDataIndex,
          burndownSteps,
          points: chartData.points,
          occurrencesByDay: byDay,
        }}
      >
        <Box
          ref={chartAreaRef}
          data-testid="burndown-chart-area"
          onPointerDownCapture={beginChartScrub}
          sx={{ width: '100%', height: CHART_HEIGHT }}
        >
          <LineChart
            height={CHART_HEIGHT}
            desc={label}
            margin={{ left: 4, right: 4, top: 12, bottom: 20 }}
            hideLegend
            axisHighlight={{ x: 'none' }}
            highlightedAxis={chartAxis}
            tooltipItem={tooltipItem}
            onHighlightedAxisChange={onHighlightedAxisChange}
            onAxisClick={onAxisClick}
            xAxis={[
              {
                id: 'burndown-x',
                data: chartData.xDays,
                scaleType: 'point',
                height: 'auto',
                disableTicks: true,
                tickInterval: xTickValues,
                tickLabelStyle: { fontSize: 10 },
                valueFormatter: (day: number) => formatOrdinalDay(isoDateForDay(year, month, day)),
              },
            ]}
            yAxis={[
              {
                min: 0,
                max: yMax,
                width: 'auto',
                disableTicks: true,
                tickInterval: yTickValues,
                tickLabelStyle: { fontSize: 10 },
                valueFormatter: (value: number) => formatGbp(value),
              },
            ]}
            series={[
              {
                id: 'remaining',
                data: chartData.remainingValues,
                curve: 'stepAfter',
                color: lineColor,
                showMark: (params) => {
                  if (pinnedDataIndex !== null) {
                    return params.index === pinnedDataIndex
                  }
                  if (hoverDataIndex !== null) {
                    return params.index === hoverDataIndex
                  }
                  return false
                },
                disableHighlight: true,
              },
            ]}
            slots={{
              mark: BurndownLineMark,
              tooltip: BurndownItemTooltip as NonNullable<LineChartSlots['tooltip']>,
            }}
            slotProps={{ tooltip: { trigger: 'item', position: 'top' } }}
            sx={{
              width: '100%',
              '& .MuiLineElement-root': { strokeWidth: 2.5 },
            }}
          >
            {todayDay !== null && (
              <ChartsReferenceLine
                x={todayDay}
                axisId="burndown-x"
                label="Today"
                labelAlign="start"
                spacing={{ x: 4, y: 4 }}
                labelStyle={{ fontSize: 10, fill: '#52b788', fontWeight: 600 }}
                lineStyle={{ stroke: '#52b788', strokeDasharray: '4 3', strokeWidth: 1.5 }}
              />
            )}
          </LineChart>
        </Box>
      </BurndownTooltipProvider>

      <Typography
        aria-live="polite"
        sx={{
          position: 'absolute',
          width: 1,
          height: 1,
          overflow: 'hidden',
          clip: 'rect(0,0,0,0)',
        }}
      >
        {activeDay !== null
          ? `${formatOrdinalDay(isoDateForDay(year, month, activeDay))}: ${label}`
          : label}
      </Typography>
    </Box>
  )
}
