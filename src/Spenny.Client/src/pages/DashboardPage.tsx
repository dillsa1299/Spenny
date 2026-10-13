// Authenticated landing stub until Dashboard burndown ships (#12).
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useAuth } from '@/auth/AuthContext'
import { MonthSelector } from '@/components/MonthSelector'

export function DashboardPage() {
  const { user } = useAuth()

  return (
    <Stack spacing={2.5}>
      <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
        Dashboard
      </Typography>
      <MonthSelector />
      <Typography color="text.secondary">
        Welcome, {user?.displayName ?? 'there'}. Month burndown and coming-up lists arrive in a later
        ticket.
      </Typography>
    </Stack>
  )
}
