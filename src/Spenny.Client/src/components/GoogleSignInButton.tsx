// Starts Google OAuth via a full-page navigation so the API can set the session cookie.
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { PressableButton } from '@/components/PressableButton'
import { startGoogleSignIn } from '@/api/authApi'

type GoogleSignInButtonProps = {
  returnPath?: string
  showDivider?: boolean
}

export function GoogleSignInButton({ returnPath = '/dashboard', showDivider = true }: GoogleSignInButtonProps) {
  return (
    <Stack spacing={2}>
      <PressableButton
        variant="outlined"
        size="large"
        fullWidth
        onClick={() => startGoogleSignIn(returnPath)}
      >
        Continue with Google
      </PressableButton>
      {showDivider ? (
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Divider sx={{ flex: 1 }} />
          <Typography variant="body2" color="text.secondary">or</Typography>
          <Divider sx={{ flex: 1 }} />
        </Stack>
      ) : null}
    </Stack>
  )
}
