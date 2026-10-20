import { describe, expect, it } from 'vitest'
import {
  glassPanelInsetSx,
  glassPanelSx,
  pillChipSx,
  shellAppBarSx,
  shellNavChromeSx,
} from '@/theme/surfaces'

describe('surface tokens', () => {
  it('exports shell and glass sx objects with reduced-transparency fallbacks', () => {
    for (const token of [shellAppBarSx, shellNavChromeSx, glassPanelSx, glassPanelInsetSx]) {
      expect(token).toMatchObject({
        '@media (prefers-reduced-transparency: reduce)': expect.objectContaining({
          backdropFilter: 'none',
        }),
      })
    }
    expect(pillChipSx).toMatchObject({
      '@media (prefers-reduced-transparency: reduce)': expect.objectContaining({
        backgroundColor: 'action.hover',
      }),
    })
  })
})
