// Confirms email from link query params (?userId=&token=).
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { useEffect, useState } from 'react'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'
import { confirmEmail } from '@/api/authApi'
import { PressableButton } from '@/components/PressableButton'
import { AuthFormLayout } from '@/pages/auth/AuthFormLayout'

export function VerifyEmailPage() {
  const [params] = useSearchParams()
  const userId = params.get('userId') ?? ''
  const token = params.get('token') ?? ''
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!userId || !token) {
        setStatus('error')
        setMessage('Invalid verification link.')
        return
      }
      try {
        const result = await confirmEmail(userId, token)
        if (!cancelled) {
          setStatus('ok')
          setMessage(result.message)
        }
      } catch (err) {
        if (!cancelled) {
          setStatus('error')
          setMessage(err instanceof Error ? err.message : 'Verification failed.')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [userId, token])

  return (
    <AuthFormLayout title="Email verification">
      <Stack spacing={2} sx={{ alignItems: 'center' }}>
        {status === 'loading' ? <CircularProgress size={32} /> : null}
        {status === 'ok' ? <Alert severity="success" sx={{ width: '100%' }}>{message}</Alert> : null}
        {status === 'error' ? <Alert severity="error" sx={{ width: '100%' }}>{message}</Alert> : null}
        <PressableButton component={RouterLink} to="/sign-in" variant="contained" fullWidth>
          Sign in
        </PressableButton>
      </Stack>
    </AuthFormLayout>
  )
}
