import { MONTH_START_ANCHOR_DAY } from '@/spending/burndownChartData'
import {
  emptyBurndownSelection,
  isEmptyAxisHighlight,
  resolveBurndownAxisClick,
  resolveBurndownAxisSelection,
  shouldIgnoreAxisHighlightClear,
} from '@/spending/burndownChartSelection'
import { describe, expect, it } from 'vitest'

const xDays = [MONTH_START_ANCHOR_DAY, 1, 2, 3, 4, 5]

describe('burndownChartSelection', () => {
  it('resolves a calendar day from axis highlight', () => {
    const result = resolveBurndownAxisSelection(
      [{ axisId: 'burndown-x', dataIndex: 3 }],
      xDays,
    )
    expect(result).toEqual({
      day: 3,
      dataIndex: 3,
      highlightedAxis: [{ axisId: 'burndown-x', dataIndex: 3 }],
    })
  })

  it('rejects month-start anchor index', () => {
    expect(resolveBurndownAxisSelection([{ axisId: 'burndown-x', dataIndex: 0 }], xDays)).toBeNull()
  })

  it('treats missing data index as empty highlight', () => {
    expect(isEmptyAxisHighlight([])).toBe(true)
    expect(isEmptyAxisHighlight([{ axisId: 'burndown-x', dataIndex: -1 }])).toBe(true)
  })

  it('ignores axis clear while pinned', () => {
    expect(shouldIgnoreAxisHighlightClear(true, [])).toBe(true)
    expect(shouldIgnoreAxisHighlightClear(false, [])).toBe(false)
    expect(
      shouldIgnoreAxisHighlightClear(true, [{ axisId: 'burndown-x', dataIndex: 2 }]),
    ).toBe(false)
  })

  it('resolves axis click by data index', () => {
    expect(resolveBurndownAxisClick(4, xDays)?.day).toBe(4)
  })

  it('emptyBurndownSelection clears all fields', () => {
    expect(emptyBurndownSelection()).toEqual({
      activeDay: null,
      liveAxis: [],
      pinnedSelection: null,
      hoverDataIndex: null,
    })
  })
})
