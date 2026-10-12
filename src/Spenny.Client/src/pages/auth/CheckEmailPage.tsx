// Post-registration: instruct user to verify email (dev links appear in API logs).
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { resendVerification } from '@/api/authApi'
import { PressableButton } from '@/components/PressableButton'
import { AuthFormLayout } from '@/pages/auth/AuthFormLayout'

export function CheckEmailPage() {
  const location = useLocation()
  const email = (location.state as { email?: string } | null)?.email ?? ''
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function onResend() {
    if (!email) return
    setSubmitting(true)
    setError(null)
    try {
      const result = await resendVerification(email)
      setMessage(result.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthFormLayout title="Check your email" subtitle="Verify your address before signing in.">
      <Stack spacing={2}>
        {message ? <Alert severity="success">{message}</Alert> : null}
        {error ? <Alert severity="error">{error}</Alert> : null}
        <Typography variant="body2" color="text.secondary">
          We sent a verification link to <strong>{email || 'your email'}</strong>. In local dev, open
          the API console log for the link.
        </Typography>
        <PressableButton variant="outlined" disabled={!email || submitting} onClick={onResend} fullWidth>
          Resend verification email
        </PressableButton>
        <PressableButton component={RouterLink} to="/sign-in" variant="contained" fullWidth>
          Back to sign in
        </PressableButton>
      </Stack>
    </AuthFormLayout>
  )
}
