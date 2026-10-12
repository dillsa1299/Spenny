import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useState } from 'react'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'
import { resetPassword } from '@/api/authApi'
import { PressableButton } from '@/components/PressableButton'
import { AuthFormLayout } from '@/pages/auth/AuthFormLayout'

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const userId = params.get('userId') ?? ''
  const token = params.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setMessage(null)
    setSubmitting(true)
    try {
      const result = await resetPassword(userId, token, password)
      setMessage(result.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthFormLayout title="Choose a new password">
      <Stack component="form" spacing={2} onSubmit={onSubmit}>
        {message ? <Alert severity="success">{message}</Alert> : null}
        {error ? <Alert severity="error">{error}</Alert> : null}
        <TextField
          label="New password"
          type="password"
          required
          helperText="Minimum 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <PressableButton type="submit" variant="contained" disabled={submitting || !userId || !token} fullWidth>
          Update password
        </PressableButton>
        <PressableButton component={RouterLink} to="/sign-in" variant="outlined" fullWidth>
          Sign in
        </PressableButton>
      </Stack>
    </AuthFormLayout>
  )
}
