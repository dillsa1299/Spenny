// Signed-in shell: bottom tab navigation, translucent chrome, shared month context for main tabs.
import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { HandCoins, LayoutDashboard, User, Wallet } from 'lucide-react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { SelectedMonthProvider } from '@/month/SelectedMonthContext'

const tabPressSx = {
  transition: 'transform 100ms ease-out',
  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
  },
  '&:active': {
    transform: 'scale(0.97)',
  },
}

const chromeSx = {
  backgroundColor: 'rgba(13, 17, 23, 0.72)',
  backdropFilter: 'blur(20px) saturate(160%)',
  borderColor: 'rgba(255,255,255,0.08)',
  '@media (prefers-reduced-transparency: reduce)': {
    backdropFilter: 'none',
    backgroundColor: 'background.paper',
  },
}

type ShellTab = {
  path: string
  label: string
  icon: ReactNode
}

const tabs: ShellTab[] = [
  { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={22} aria-hidden /> },
  { path: '/spending', label: 'Spending', icon: <HandCoins size={22} aria-hidden /> },
  { path: '/income', label: 'Income', icon: <Wallet size={22} aria-hidden /> },
  { path: '/profile', label: 'Profile', icon: <User size={22} aria-hidden /> },
]

function tabIndexForPath(pathname: string): number {
  const index = tabs.findIndex((tab) => pathname === tab.path || pathname.startsWith(`${tab.path}/`))
  return index >= 0 ? index : 0
}

export function AuthenticatedShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const tabIndex = tabIndexForPath(location.pathname)

  return (
    <SelectedMonthProvider>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Container
          component="main"
          maxWidth="sm"
          disableGutters
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            px: 2,
            pt: 3,
            pb: 10,
            width: '100%',
          }}
        >
          {user?.displayName ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1.5, fontWeight: 500 }}
              aria-label={`Signed in as ${user.displayName}`}
            >
              {user.displayName}
            </Typography>
          ) : null}
          <Outlet />
        </Container>
        <Box
          component="nav"
          aria-label="Primary"
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: (theme) => theme.zIndex.appBar,
            borderTop: '1px solid',
            ...chromeSx,
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
