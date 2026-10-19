// MUI X axis tooltip slot for the burndown chart (same UI on all breakpoints).
import { ChartsTooltipContainer, useAxesTooltip } from '@mui/x-charts/ChartsTooltip'
import type { ChartsTooltipProps } from '@mui/x-charts/ChartsTooltip'
import { BurndownDayTooltipContent } from '@/components/spending/BurndownDayTooltipContent'
import { useBurndownTooltipContext } from '@/components/spending/BurndownTooltipContext'
import { MONTH_START_ANCHOR_DAY } from '@/spending/burndownChartData'
import { buildBurndownDaySummary } from '@/spending/burndownDaySummary'

export function BurndownAxisTooltip(props: ChartsTooltipProps<'axis'>) {
  const { trigger = 'axis', ...containerProps } = props
  const { year, month, burndownSteps, points, occurrencesByDay } = useBurndownTooltipContext()

  const axesTooltip = useAxesTooltip()
  const axisEntry = axesTooltip?.[0]
  const day =
    axisEntry?.axisValue !== null && axisEntry?.axisValue !== undefined
      ? Number(axisEntry.axisValue)
      : null

  if (day === null || Number.isNaN(day) || day === MONTH_START_ANCHOR_DAY) {
    return null
  }

  const payments = occurrencesByDay.get(day) ?? []
  const summary = buildBurndownDaySummary(year, month, day, burndownSteps, points, payments)

  return (
    <ChartsTooltipContainer
      trigger={trigger}
      // Anchor to the highlighted point, not the chart box, so the tooltip sits just above the
      // step line instead of covering the remaining-balance headline above the plot.
      anchor="node"
      position="top"
      disablePortal={false}
      slotProps={{
        root: {
          strategy: 'fixed',
        },
      }}
      {...containerProps}
    >
      <BurndownDayTooltipContent summary={summary} />
    </ChartsTooltipContainer>
  )
}
