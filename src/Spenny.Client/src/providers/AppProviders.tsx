// Root providers: MUI theme and smooth scroll (Lenis + GSAP).
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import type { ReactNode } from 'react'
import { spennyTheme } from '@/theme/theme'
import { SmoothScrollProvider } from '@/providers/SmoothScrollProvider'

type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider theme={spennyTheme}>
      <CssBaseline />
      <SmoothScrollProvider>{children}</SmoothScrollProvider>
    </ThemeProvider>
  )
}
