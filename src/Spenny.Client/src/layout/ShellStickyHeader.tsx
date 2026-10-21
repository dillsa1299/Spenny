// Sticky stack for the dev-environment strip and app bar so they pin together on scroll.
import Box from '@mui/material/Box'
import type { ReactNode } from 'react'
import { DevelopmentEnvironmentBanner } from '@/components/DevelopmentEnvironmentBanner'

type ShellStickyHeaderProps = {
  children: ReactNode
}

export function ShellStickyHeader({ children }: ShellStickyHeaderProps) {
  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: (theme) => theme.zIndex.appBar + 1,
      }}
    >
      <DevelopmentEnvironmentBanner />
      {children}
    </Box>
  )
}
