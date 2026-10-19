// Month burndown via MUI X LineChart; axis tooltip shows payments for the highlighted day.
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { ChartsReferenceLine } from '@mui/x-charts/ChartsReferenceLine'
import { LineChart } from '@mui/x-charts/LineChart'
import type { LineChartSlots } from '@mui/x-charts/LineChart'
import type { AxisItemIdentifier } from '@mui/x-charts/models'
import { useMemo, useState } from 'react'
import type { BurndownStepDto, SpendingOccurrenceDto } from '@/api/spendingTypes'
import { BurndownAxisTooltip } from '@/components/spending/BurndownAxisTooltip'
import { BurndownTooltipProvider } from '@/components/spending/BurndownTooltipContext'
import { dayFromIsoDate } from '@/spending/burndownPoints'
import {
  buildBurndownLineChartData,
  burndownAxisMarkers,
  dayFromAxisHighlight,
  isoDateForDay,
} from '@/spending/burndownChartData'
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
  const [activeDay, setActiveDay] = useState<number | null>(null)
  const [axisTooltipItem, setAxisTooltipItem] = useState<{
    seriesId: 'remaining'
    dataIndex: number
  } | null>(null)

  const chartData = useMemo(
    () => buildBurndownLineChartData(year, month, monthTotal, burndownSteps),
    [year, month, monthTotal, burndownSteps],
  )
  const byDay = useMemo(() => occurrencesByDay(occurrences), [occurrences])

  const todayDay = showTodayMarker ? dayFromIsoDate(asOfDate) : null

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

  const onHighlightedAxisChange = (axisItems: AxisItemIdentifier[]) => {
    const xItem = axisItems.find((item) => item.axisId === 'burndown-x') ?? axisItems[0]
    const dataIndex = xItem?.dataIndex
    if (dataIndex === undefined || dataIndex < 0) {
      setActiveDay(null)
      setAxisTooltipItem(null)
      return
    }
    setActiveDay(dayFromAxisHighlight(chartData.xDays, dataIndex))
    // Axis tooltips do not set a line tooltip item; node anchor needs one on the first tap/click.
    setAxisTooltipItem({ seriesId: 'remaining', dataIndex })
  }

  const yMax = Math.max(monthTotal, 1)
  const lineColor = theme.palette.secondary.main
  const axisMarkers = useMemo(() => burndownAxisMarkers(chartData.points), [chartData.points])
  const xTickValues = axisMarkers.labelDays.length > 0 ? axisMarkers.labelDays : [1]
  const yTickValues =
    axisMarkers.labelAmounts.length > 0 ? axisMarkers.labelAmounts : [0, yMax]

  return (
    <Box sx={{ width: '100%', minWidth: 0, position: 'relative' }}>
      <Typography
        component="p"
        sx={{
          fontWeight: 700,
          letterSpacing: '-0.02em',
          fontVariantNumeric: 'tabular-nums',
          fontSize: { xs: '1.35rem', sm: '1.5rem' },
          lineHeight: 1.2,
          mb: { xs: 1, sm: 1.5 },
        }}
      >
        <Box component="span" sx={{ display: 'block' }}>
          {formatGbp(displayedRemaining)} / {formatGbp(monthTotal)}
        </Box>
        <Box
          component="span"
          sx={{
            display: 'block',
            fontSize: '0.82em',
            fontWeight: 600,
            color: 'text.secondary',
            mt: 0.25,
          }}
        >
          remaining
        </Box>
      </Typography>

      <BurndownTooltipProvider value={{ year, month, occurrencesByDay: byDay }}>
        <Box sx={{ width: '100%', height: CHART_HEIGHT }}>
          <LineChart
          height={CHART_HEIGHT}
          desc={label}
          margin={{ left: 4, right: 4, top: 12, bottom: 20 }}
          hideLegend
          axisHighlight={{ x: 'line' }}
          onHighlightedAxisChange={onHighlightedAxisChange}
          tooltipItem={axisTooltipItem}
          xAxis={[
            {
              id: 'burndown-x',
              data: chartData.xDays,
              scaleType: 'point',
              height: 'auto',
              disableTicks: true,
              tickInterval: xTickValues,
              tickLabelStyle: { fontSize: 10 },
              valueFormatter: (day: number) => String(day),
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
              showMark: false,
              disableHighlight: true,
            },
          ]}
          slots={{ tooltip: BurndownAxisTooltip as NonNullable<LineChartSlots['tooltip']> }}
          slotProps={{ tooltip: { trigger: 'axis', anchor: 'node', position: 'top' } }}
          sx={{
            width: '100%',
            '& .MuiLineElement-root': { strokeWidth: 2.5 },
          }}
        >
          {todayDay !== null && (
            <ChartsReferenceLine
              x={todayDay}
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
