// Pure helpers for burndown chart hover vs click-pinned axis selection (MUI X axis highlight).
import type { AxisItemIdentifier } from '@mui/x-charts/models'
import { dayFromAxisHighlight } from '@/spending/burndownChartData'

const BURNDOWN_X_AXIS_ID = 'burndown-x'

export type BurndownAxisSelection = {
  day: number
  dataIndex: number
  highlightedAxis: AxisItemIdentifier[]
}

export type BurndownSelectionState = {
  activeDay: number | null
  liveAxis: AxisItemIdentifier[]
  pinnedSelection: BurndownAxisSelection | null
  hoverDataIndex: number | null
}

export function burndownXAxisItem(axisItems: AxisItemIdentifier[]): AxisItemIdentifier | undefined {
  return axisItems.find((item) => item.axisId === BURNDOWN_X_AXIS_ID) ?? axisItems[0]
}

export function isEmptyAxisHighlight(axisItems: AxisItemIdentifier[]): boolean {
  const xItem = burndownXAxisItem(axisItems)
  const dataIndex = xItem?.dataIndex
  return dataIndex === undefined || dataIndex < 0
}

export function shouldIgnoreAxisHighlightClear(
  hasPin: boolean,
  axisItems: AxisItemIdentifier[],
): boolean {
  return hasPin && isEmptyAxisHighlight(axisItems)
}

export function resolveBurndownAxisSelection(
  axisItems: AxisItemIdentifier[],
  xDays: number[],
): BurndownAxisSelection | null {
  const xItem = burndownXAxisItem(axisItems)
  const dataIndex = xItem?.dataIndex
  if (dataIndex === undefined || dataIndex < 0) {
    return null
  }
  const day = dayFromAxisHighlight(xDays, dataIndex)
  if (day === null) {
    return null
  }
  const axisId = xItem?.axisId ?? BURNDOWN_X_AXIS_ID
  const highlightedAxis: AxisItemIdentifier[] = [{ axisId, dataIndex }]
  return {
    day,
    dataIndex,
    highlightedAxis,
  }
}

export function resolveBurndownAxisClick(
  dataIndex: number,
  xDays: number[],
): BurndownAxisSelection | null {
  return resolveBurndownAxisSelection(
    [{ axisId: BURNDOWN_X_AXIS_ID, dataIndex }],
    xDays,
  )
}

export function emptyBurndownSelection(): BurndownSelectionState {
  return {
    activeDay: null,
    liveAxis: [],
    pinnedSelection: null,
    hoverDataIndex: null,
  }
}
