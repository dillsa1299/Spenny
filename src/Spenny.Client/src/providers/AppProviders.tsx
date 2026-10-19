// Root providers: MUI theme and smooth scroll (Lenis + GSAP).
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import type { ReactNode } from 'react'
import { AppBackground } from '@/components/AppBackground'
import { AuthProvider } from '@/auth/AuthContext'
import { SmoothScrollProvider } from '@/providers/SmoothScrollProvider'
import { spennyTheme } from '@/theme/theme'

type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider theme={spennyTheme}>
      <CssBaseline enableColorScheme />
      <AppBackground />
      <AuthProvider>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
