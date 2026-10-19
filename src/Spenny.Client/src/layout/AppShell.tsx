// Public chrome: translucent top bar for marketing and auth routes (not the signed-in tab shell).
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { Link as RouterLink, Outlet } from 'react-router-dom'
import { PressableButton } from '@/components/PressableButton'

export function AppShell() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: 'rgba(13, 17, 23, 0.55)',
          backdropFilter: 'blur(20px) saturate(160%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          '@media (prefers-reduced-transparency: reduce)': {
            backdropFilter: 'none',
            backgroundColor: 'background.paper',
            borderBottomColor: 'divider',
          },
        }}
      >
        <Toolbar sx={{ gap: 1, minHeight: { xs: 56, sm: 64 } }}>
          <Typography
            component={RouterLink}
            to="/"
            variant="h6"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            Spenny
          </Typography>
          <PressableButton component={RouterLink} to="/sign-in" color="inherit" sx={{ fontWeight: 600 }}>
            Sign in
          </PressableButton>
          <PressableButton
            component={RouterLink}
            to="/sign-up"
            variant="contained"
            sx={{ borderRadius: 999, px: 2, fontWeight: 600 }}
          >
            Join now
          </PressableButton>
        </Toolbar>
      </AppBar>
      <Container
        component="main"
        maxWidth={false}
        sx={{
          width: '100%',
          maxWidth: 960,
          py: { xs: 3, sm: 4, md: 5 },
          px: { xs: 2, sm: 3 },
        }}
      >
        <Outlet />
      </Container>
    </Box>
  )
}
