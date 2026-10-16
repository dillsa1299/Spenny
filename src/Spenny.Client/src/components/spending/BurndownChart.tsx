// SVG step burndown for the selected month; today marker when API requests it.
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { BurndownStepDto } from '@/api/spendingTypes'
import { buildBurndownPoints, dayFromIsoDate } from '@/spending/burndownPoints'
import { formatGbp } from '@/lib/formatGbp'

type BurndownChartProps = {
  year: number
  month: number
  monthTotal: number
  burndownSteps: BurndownStepDto[]
  showTodayMarker: boolean
  asOfDate: string
  remainingAtToday: number
}

const width = 320
const height = 160
const padding = { top: 12, right: 8, bottom: 24, left: 8 }

export function BurndownChart({
  year,
  month,
  monthTotal,
  burndownSteps,
  showTodayMarker,
  asOfDate,
  remainingAtToday,
}: BurndownChartProps) {
  const daysInMonth = new Date(year, month, 0).getDate()
  const points = buildBurndownPoints(year, month, monthTotal, burndownSteps)
  const maxY = Math.max(monthTotal, 1)
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  const xForDay = (day: number) => padding.left + ((day - 1) / (daysInMonth - 1 || 1)) * chartW
  const yForValue = (value: number) => padding.top + chartH - (value / maxY) * chartH

  const polyline = points
    .map((p) => `${xForDay(p.day)},${yForValue(p.remaining)}`)
    .join(' ')

  const todayDay = showTodayMarker ? dayFromIsoDate(asOfDate) : null
  const label =
    monthTotal === 0
      ? 'No scheduled spending this month'
      : `Burndown from ${formatGbp(monthTotal)}; ${formatGbp(remainingAtToday)} left after today`

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {formatGbp(monthTotal)} scheduled
      </Typography>
      <svg
        width="100%"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={label}
        style={{ display: 'block', maxWidth: width }}
      >
        <line
          x1={padding.left}
          y1={padding.top + chartH}
          x2={width - padding.right}
          y2={padding.top + chartH}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={1}
        />
        {monthTotal > 0 && (
          <polyline
            fill="none"
            stroke="#e63946"
            strokeWidth={2}
            strokeLinejoin="round"
            points={polyline}
          />
        )}
        {todayDay !== null && (
          <line
            x1={xForDay(todayDay)}
            y1={padding.top}
            x2={xForDay(todayDay)}
            y2={padding.top + chartH}
            stroke="#52b788"
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
        )}
      </svg>
    </Box>
  )
}
