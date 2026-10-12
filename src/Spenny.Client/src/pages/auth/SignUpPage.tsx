// Local registration; redirects to check-email state (no session until verified).
import Alert from '@mui/material/Alert'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { registerLocal } from '@/api/authApi'
import { PressableButton } from '@/components/PressableButton'
import { AuthFormLayout } from '@/pages/auth/AuthFormLayout'

export function SignUpPage() {
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await registerLocal(email.trim(), password, displayName.trim())
      navigate('/check-email', { replace: true, state: { email: email.trim() } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthFormLayout title="Join Spenny" subtitle="At least 8 characters for your password.">
      <Stack component="form" spacing={2} onSubmit={onSubmit}>
        {error ? <Alert severity="error">{error}</Alert> : null}
        <TextField
          label="Display name"
          autoComplete="name"
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="new-password"
          required
          helperText="Minimum 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <PressableButton type="submit" variant="contained" size="large" disabled={submitting} fullWidth>
          Create account
        </PressableButton>
        <Typography variant="body2" color="text.secondary">
          Already have an account?{' '}
          <Link component={RouterLink} to="/sign-in" underline="hover">
            Sign in
          </Link>
        </Typography>
      </Stack>
    </AuthFormLayout>
  )
}
