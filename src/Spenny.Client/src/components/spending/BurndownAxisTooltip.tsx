// MUI X axis tooltip slot for the burndown chart (same UI on all breakpoints).
import { ChartsTooltipContainer, useAxesTooltip } from '@mui/x-charts/ChartsTooltip'
import type { ChartsTooltipProps } from '@mui/x-charts/ChartsTooltip'
import { BurndownDayTooltipContent } from '@/components/spending/BurndownDayTooltipContent'
import { useBurndownTooltipContext } from '@/components/spending/BurndownTooltipContext'
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

  if (day === null || Number.isNaN(day)) {
    return null
  }

  const payments = occurrencesByDay.get(day) ?? []
  const summary = buildBurndownDaySummary(year, month, day, burndownSteps, points, payments)

  return (
    <ChartsTooltipContainer trigger={trigger} anchor="node" position="top" {...containerProps}>
      <BurndownDayTooltipContent summary={summary} />
    </ChartsTooltipContainer>
  )
}
