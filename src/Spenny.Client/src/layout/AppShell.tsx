// Public chrome: translucent top bar for marketing and auth routes (not the signed-in tab shell).
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { Link as RouterLink, Outlet } from 'react-router-dom'

export function AppShell() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: 'rgba(13, 17, 23, 0.72)',
          backdropFilter: 'blur(20px) saturate(160%)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          '@media (prefers-reduced-transparency: reduce)': {
            backdropFilter: 'none',
            backgroundColor: 'background.paper',
          },
        }}
      >
        <Toolbar>
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
          <Button component={RouterLink} to="/sign-in" color="inherit">
            Sign in
          </Button>
          <Button component={RouterLink} to="/sign-up" variant="contained" sx={{ ml: 1 }}>
            Join now
          </Button>
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ flex: 1, py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  )
}
