// Centered auth card on dark background with translucent material.
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { glassPanelSx } from '@/theme/surfaces'

type AuthFormLayoutProps = {
  title: string
  subtitle?: string
  children: ReactNode
}

export function AuthFormLayout({ title, subtitle, children }: AuthFormLayoutProps) {
  return (
    <Box
      sx={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 420,
          p: 3,
          borderRadius: 3,
          ...glassPanelSx,
        }}
      >
        <Stack spacing={2.5}>
          <Box>
            <Typography
              component={RouterLink}
              to="/"
              variant="overline"
              sx={{ color: 'primary.main', textDecoration: 'none', letterSpacing: '0.12em' }}
            >
              Spenny
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.02em', mt: 0.5 }}>
              {title}
            </Typography>
            {subtitle ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {subtitle}
              </Typography>
            ) : null}
          </Box>
          {children}
        </Stack>
      </Paper>
    </Box>
  )
}
