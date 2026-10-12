// Shared chrome: translucent top bar; outlet for page content.
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { Link as RouterLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'

export function AppShell() {
  const { user, domainAccess } = useAuth()
  const homeHref = domainAccess ? '/dashboard' : '/'

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
            to={homeHref}
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
          {domainAccess ? (
            <Button component={RouterLink} to="/dashboard" color="inherit">
              Dashboard
            </Button>
          ) : (
            <>
              <Button component={RouterLink} to="/sign-in" color="inherit">
                Sign in
              </Button>
              <Button component={RouterLink} to="/sign-up" variant="contained" sx={{ ml: 1 }}>
                Join now
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ flex: 1, py: 4 }}>
        <Outlet />
      </Container>
      {user ? (
        <Box component="footer" sx={{ py: 2, textAlign: 'center', opacity: 0.6 }}>
          <Typography variant="caption">Signed in as {user.displayName}</Typography>
        </Box>
      ) : null}
    </Box>
  )
}
