// Custom line mark: hollow hover ring, or pinned ring with centered white center dot.
import { useTheme } from '@mui/material/styles'
import type { MarkElementProps } from '@mui/x-charts/LineChart'
import { useBurndownTooltipContext } from '@/components/spending/BurndownTooltipContext'

const OUTER_R = 6
const STROKE_WIDTH = 2
const INNER_R = 2.5

export function BurndownLineMark(props: MarkElementProps) {
  const { pinnedDataIndex } = useBurndownTooltipContext()
  const theme = useTheme()
  const { hidden, seriesId, dataIndex, color } = props
  const x = Number(props.x)
  const y = Number(props.y)

  if (hidden || Number.isNaN(x) || Number.isNaN(y)) {
    return null
  }

  const paper = (theme.vars || theme).palette.background.paper
  const strokeColor = color ?? theme.palette.secondary.main
  const isPinned = pinnedDataIndex === dataIndex

  return (
    <g
      transform={`translate(${x}, ${y})`}
      data-series-id={seriesId}
      data-series={seriesId}
      pointerEvents="none"
      opacity={isPinned ? 1 : 0.9}
    >
      <circle
        cx={0}
        cy={0}
        r={OUTER_R}
        fill={paper}
        stroke={strokeColor}
        strokeWidth={STROKE_WIDTH}
      />
      {isPinned ? <circle cx={0} cy={0} r={INNER_R} fill="#ffffff" /> : null}
    </g>
  )
}
