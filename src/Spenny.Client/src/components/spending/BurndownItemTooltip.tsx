// MUI X item tooltip slot for the burndown chart; anchors above the active line point.
import { ChartsTooltipContainer, useItemTooltip } from '@mui/x-charts/ChartsTooltip'
import type { ChartsTooltipProps } from '@mui/x-charts/ChartsTooltip'
import { BurndownDayTooltipContent } from '@/components/spending/BurndownDayTooltipContent'
import { useBurndownTooltipContext } from '@/components/spending/BurndownTooltipContext'
import { dayFromAxisHighlight, MONTH_START_ANCHOR_DAY } from '@/spending/burndownChartData'
import { buildBurndownDaySummary } from '@/spending/burndownDaySummary'

export function BurndownItemTooltip(props: ChartsTooltipProps<'item'>) {
  const { trigger = 'item', ...containerProps } = props
  const { year, month, xDays, burndownSteps, points, occurrencesByDay } = useBurndownTooltipContext()

  const item = useItemTooltip<'line'>()
  const dataIndex = item?.identifier.dataIndex
  const day =
    dataIndex !== undefined ? dayFromAxisHighlight(xDays, dataIndex) : null

  if (day === null || day === MONTH_START_ANCHOR_DAY) {
    return null
  }

  const payments = occurrencesByDay.get(day) ?? []
  const summary = buildBurndownDaySummary(year, month, day, burndownSteps, points, payments)

  return (
    <ChartsTooltipContainer
      trigger={trigger}
      data-burndown-axis-tooltip=""
      anchor="node"
      position="top"
      disablePortal={false}
      container={() => document.body}
      {...containerProps}
    >
      <BurndownDayTooltipContent summary={summary} />
    </ChartsTooltipContainer>
  )
}
