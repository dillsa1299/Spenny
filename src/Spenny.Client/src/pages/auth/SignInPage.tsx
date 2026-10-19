// Local sign-in; unverified users see an inline error and stay on this screen (no app shell).
import Alert from '@mui/material/Alert'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import { Link as RouterLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { fetchAuthProviders, loginLocal, resendVerification } from '@/api/authApi'
import { useAuth } from '@/auth/AuthContext'
import { GoogleSignInButton } from '@/components/GoogleSignInButton'
import { PressableButton } from '@/components/PressableButton'
import { AuthFormLayout } from '@/pages/auth/AuthFormLayout'

type SignInLocationState = {
  from?: string
}

export function SignInPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setAuthenticatedUser, refresh } = useAuth()
  const [googleEnabled, setGoogleEnabled] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null)
  const [searchParams] = useSearchParams()
  const locationState = location.state as SignInLocationState | null
  const from = locationState?.from ?? '/dashboard'

  useEffect(() => {
    fetchAuthProviders()
      .then((providers) => setGoogleEnabled(providers.google))
      .catch(() => setGoogleEnabled(false))
  }, [])

  const googleError = searchParams.get('google_error')

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setInfo(null)
    setUnverifiedEmail(null)
    setSubmitting(true)
    try {
      const result = await loginLocal(email.trim(), password)
      if (!result.ok) {
        if (result.code === 'email_not_verified') {
          setUnverifiedEmail(email.trim())
        }
        setError(result.message)
        return
      }
      setAuthenticatedUser(result.user)
      await refresh()
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed.')
    } finally {
      setSubmitting(false)
    }
  }

  async function onResend() {
    if (!unverifiedEmail) return
    setSubmitting(true)
    setError(null)
    try {
      const { message } = await resendVerification(unverifiedEmail)
      setInfo(message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend verification.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthFormLayout title="Sign in" subtitle="Use Google or your email and password.">
      <Stack spacing={2}>
        {googleError === 'email_in_use' ? (
          <Alert severity="error">That email already has a password account. Sign in with email and password.</Alert>
        ) : googleError ? (
          <Alert severity="error">Google sign-in did not complete. Try again or use your password.</Alert>
        ) : null}
        {googleEnabled ? <GoogleSignInButton returnPath={from} /> : null}
      <Stack component="form" spacing={2} onSubmit={onSubmit}>
        {error ? <Alert severity="error">{error}</Alert> : null}
        {info ? <Alert severity="success">{info}</Alert> : null}
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
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <PressableButton type="submit" variant="contained" size="large" disabled={submitting} fullWidth>
          Sign in
        </PressableButton>
        {unverifiedEmail ? (
          <PressableButton variant="outlined" disabled={submitting} onClick={onResend} fullWidth>
            Resend verification email
          </PressableButton>
        ) : null}
        <Typography variant="body2" color="text.secondary">
          <Link component={RouterLink} to="/forgot-password" underline="hover">
            Forgot password?
          </Link>
          {' · '}
          <Link component={RouterLink} to="/sign-up" underline="hover">
            Create account
          </Link>
        </Typography>
      </Stack>
      </Stack>
    </AuthFormLayout>
  )
}
