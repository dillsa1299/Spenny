// Shared grab handle and icon header for frosted bottom sheets.
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'

export function BottomSheetHandle() {
  return (
    <Box
      aria-hidden
      sx={{
        width: 36,
        height: 5,
        borderRadius: 3,
        bgcolor: 'rgba(255,255,255,0.28)',
        mx: 'auto',
        mb: 2,
      }}
    />
  )
}

type BottomSheetHeaderProps = {
  icon: ReactNode
  title: string
  subtitle?: string
}

export function BottomSheetHeader({ icon, title, subtitle }: BottomSheetHeaderProps) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2.5 }}>
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'rgba(82, 183, 136, 0.16)',
          color: 'primary.main',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            fontSize: { xs: '1.15rem', sm: '1.25rem' },
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, lineHeight: 1.35 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Stack>
  )
}
