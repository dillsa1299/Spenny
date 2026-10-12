import Alert from '@mui/material/Alert'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { forgotPassword } from '@/api/authApi'
import { PressableButton } from '@/components/PressableButton'
import { AuthFormLayout } from '@/pages/auth/AuthFormLayout'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setMessage(null)
    setSubmitting(true)
    try {
      const result = await forgotPassword(email.trim())
      setMessage(result.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthFormLayout title="Reset password">
      <Stack component="form" spacing={2} onSubmit={onSubmit}>
        {message ? <Alert severity="success">{message}</Alert> : null}
        {error ? <Alert severity="error">{error}</Alert> : null}
        <TextField
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <PressableButton type="submit" variant="contained" disabled={submitting} fullWidth>
          Send reset link
        </PressableButton>
        <Typography variant="body2" color="text.secondary">
          <Link component={RouterLink} to="/sign-in" underline="hover">
            Back to sign in
          </Link>
        </Typography>
      </Stack>
    </AuthFormLayout>
  )
}
