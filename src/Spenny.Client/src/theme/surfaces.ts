// Shared translucent shell chrome and frosted panel tokens (dark theme + reduced-transparency fallbacks).
import type { Theme } from '@mui/material/styles'
import type { SystemStyleObject } from '@mui/system'

/** Sticky app shell bars (public AppShell + signed-in top/bottom chrome). */
export const shellAppBarSx: SystemStyleObject<Theme> = {
  backgroundColor: 'rgba(13, 17, 23, 0.55)',
  backdropFilter: 'blur(20px) saturate(160%)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  '@media (prefers-reduced-transparency: reduce)': {
    backdropFilter: 'none',
    backgroundColor: 'background.paper',
    borderBottomColor: 'divider',
  },
}

/** Bottom nav: same material as top bar with a top edge instead of bottom. */
export const shellNavChromeSx: SystemStyleObject<Theme> = {
  backgroundColor: 'rgba(13, 17, 23, 0.55)',
  backdropFilter: 'blur(20px) saturate(160%)',
  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
  '@media (prefers-reduced-transparency: reduce)': {
    backdropFilter: 'none',
    backgroundColor: 'background.paper',
    borderTopColor: 'divider',
  },
}

/** Frosted card surfaces (auth forms, teasers, landing demo header). */
export const glassPanelSx: SystemStyleObject<Theme> = {
  backgroundColor: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(20px) saturate(160%)',
  border: '1px solid rgba(255,255,255,0.12)',
  '@media (prefers-reduced-transparency: reduce)': {
    backdropFilter: 'none',
    backgroundColor: 'background.paper',
    borderColor: 'divider',
  },
}

/**
 * Frosted fill for a lower card section. Do not wrap interactive charts — backdrop-filter on an
 * ancestor breaks MUI X tooltip placement. Use as a pointer-events:none layer behind chart content.
 */
export const glassPanelInsetSx: SystemStyleObject<Theme> = {
  backgroundColor: 'rgba(255,255,255,0.04)',
  backdropFilter: 'blur(20px) saturate(160%)',
  '@media (prefers-reduced-transparency: reduce)': {
    backdropFilter: 'none',
    backgroundColor: 'background.paper',
  },
}

/** Small highlight pills on marketing surfaces. */
export const pillChipSx: SystemStyleObject<Theme> = {
  border: '1px solid rgba(255, 255, 255, 0.12)',
  backgroundColor: 'rgba(255, 255, 255, 0.04)',
  '@media (prefers-reduced-transparency: reduce)': {
    backgroundColor: 'action.hover',
    borderColor: 'divider',
  },
}
