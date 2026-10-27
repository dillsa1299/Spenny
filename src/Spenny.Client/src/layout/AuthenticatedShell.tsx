// Signed-in shell: top bar, bottom tab navigation, shared month context for main tabs.
import type { ReactNode } from 'react'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { BarChart2, HandCoins, LayoutDashboard, LogOut, User, Wallet } from 'lucide-react'
import { Outlet, Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { SiteLegalFooter } from '@/consent/SiteLegalFooter'
import { authenticatedShellGreeting } from '@/lib/authenticatedShellGreeting'
import { SelectedMonthProvider } from '@/month/SelectedMonthContext'
import { ShellStickyHeader } from '@/layout/ShellStickyHeader'
import { shellAppBarSx, shellNavChromeSx } from '@/theme/surfaces'

const tabPressSx = {
  transition: 'transform 100ms ease-out',
  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
  },
  '&:active': {
    transform: 'scale(0.97)',
  },
}

type ShellTab = {
  path: string
  label: string
  icon: ReactNode
}

const baseTabs: ShellTab[] = [
  { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={22} aria-hidden /> },
  { path: '/spending', label: 'Spending', icon: <HandCoins size={22} aria-hidden /> },
  { path: '/income', label: 'Income', icon: <Wallet size={22} aria-hidden /> },
  { path: '/profile', label: 'Profile', icon: <User size={22} aria-hidden /> },
]

const adminTab: ShellTab = {
  path: '/admin',
  label: 'Admin',
  icon: <BarChart2 size={22} aria-hidden />,
}

function tabIndexForPath(pathname: string, tabs: ShellTab[]): number {
  const index = tabs.findIndex((tab) => pathname === tab.path || pathname.startsWith(`${tab.path}/`))
  return index >= 0 ? index : 0
}

export function AuthenticatedShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const tabs = user?.isAdmin ? [...baseTabs, adminTab] : baseTabs
  const tabIndex = tabIndexForPath(location.pathname, tabs)
  const greetingLine = authenticatedShellGreeting(user)

  return (
    <SelectedMonthProvider>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <ShellStickyHeader>
        <AppBar position="static" elevation={0} sx={shellAppBarSx}>
          <Toolbar sx={{ gap: 1, minHeight: { xs: 56, sm: 64 } }}>
            <Typography
              component={RouterLink}
              to="/dashboard"
              variant="h6"
              sx={{
                textDecoration: 'none',
                color: 'inherit',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                flexShrink: 0,
              }}
            >
              Spenny
            </Typography>
            <Typography
              variant="body2"
              sx={{
                flex: 1,
                minWidth: 0,
                textAlign: 'center',
                fontWeight: 600,
                color: 'text.secondary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {greetingLine}
            </Typography>
            <IconButton
              color="inherit"
              aria-label="Sign out"
              onClick={() => signOut()}
              sx={{ flexShrink: 0 }}
            >
              <LogOut size={22} aria-hidden />
            </IconButton>
          </Toolbar>
        </AppBar>
        </ShellStickyHeader>
        <Container
          component="main"
          maxWidth="sm"
          disableGutters
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            px: 2,
            pt: 2,
            pb: 2,
            width: '100%',
          }}
        >
          <Outlet />
        </Container>
        <Box sx={{ pb: 10 }}>
          <SiteLegalFooter />
        </Box>
        <Box
          component="nav"
          aria-label="Primary"
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: (theme) => theme.zIndex.appBar,
            ...shellNavChromeSx,
          }}
        >
          <Container maxWidth="sm" disableGutters>
            <BottomNavigation
              value={tabIndex}
              onChange={(_event, newValue: number) => {
                const tab = tabs[newValue]
                if (tab) {
                  navigate(tab.path)
                }
              }}
              showLabels
              sx={{
                backgroundColor: 'transparent',
                height: 'auto',
                py: 0.5,
                '& .MuiBottomNavigationAction-root': tabPressSx,
              }}
            >
              {tabs.map((tab) => (
                <BottomNavigationAction
                  key={tab.path}
                  label={tab.label}
                  icon={tab.icon}
                  sx={{ minWidth: 0, py: 1 }}
                />
              ))}
            </BottomNavigation>
          </Container>
        </Box>
      </Box>
    </SelectedMonthProvider>
  )
}
