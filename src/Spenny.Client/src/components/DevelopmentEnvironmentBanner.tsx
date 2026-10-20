// Sticky strip shown only on the development deployment build (not local Vite dev unless configured).
import Box from '@mui/material/Box'
import { isDevelopmentDeployment } from '@/lib/deploymentEnvironment'

export function DevelopmentEnvironmentBanner() {
  if (!isDevelopmentDeployment()) {
    return null
  }

  return (
    <Box
      role="status"
      aria-label="Development environment"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: (theme) => theme.zIndex.appBar + 1,
        py: 0.5,
        px: 2,
        textAlign: 'center',
        typography: 'caption',
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        bgcolor: 'warning.main',
        color: 'warning.contrastText',
      }}
    >
      Development
    </Box>
  )
}
