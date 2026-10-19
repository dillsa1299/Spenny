// Profile stub until account settings and deletion ship (#14).
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useAuth } from '@/auth/AuthContext'
import { PressableButton } from '@/components/PressableButton'

export function ProfilePage() {
  const { user, signOut } = useAuth()

  return (
    <Stack spacing={{ xs: 2, sm: 2.5 }} sx={{ width: '100%', minWidth: 0 }}>
      <Typography
        variant="h4"
        sx={{ fontWeight: 700, letterSpacing: '-0.02em', fontSize: { xs: '1.5rem', sm: '2.125rem' } }}
      >
        Profile
      </Typography>
      <Typography color="text.secondary">
        Signed in as <strong>{user?.displayName ?? 'there'}</strong>
        {user?.email ? ` (${user.email})` : null}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Display name, password, and account deletion arrive in a later ticket.
      </Typography>
      <PressableButton variant="outlined" onClick={() => signOut()}>
        Sign out
      </PressableButton>
    </Stack>
  )
}
