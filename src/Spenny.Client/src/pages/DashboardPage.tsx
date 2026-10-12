// Authenticated landing stub until Dashboard burndown ships (#5 follow-ups).
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useAuth } from '@/auth/AuthContext'
import { PressableButton } from '@/components/PressableButton'

export function DashboardPage() {
  const { user, signOut } = useAuth()

  return (
    <Stack spacing={2}>
      <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
        Dashboard
      </Typography>
      <Typography color="text.secondary">
        Welcome, {user?.displayName ?? 'there'}. Month burndown and Spending lists arrive in later tickets.
      </Typography>
      <PressableButton variant="outlined" onClick={() => signOut()}>
        Sign out
      </PressableButton>
    </Stack>
  )
}
