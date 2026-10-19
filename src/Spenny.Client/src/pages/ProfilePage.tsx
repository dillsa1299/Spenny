// Profile: identity, local password change, account deletion, and sign out.
import Alert from '@mui/material/Alert'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { changePassword, deleteAccount, updateDisplayName } from '@/api/authApi'
import { useAuth } from '@/auth/AuthContext'
import { useFlashNotice } from '@/flash/FlashNoticeContext'
import { PressableButton } from '@/components/PressableButton'

export function ProfilePage() {
  const { user, refresh, signOut, clearSession } = useAuth()
  const { showFlash } = useFlashNotice()
  const navigate = useNavigate()

  const [displayName, setDisplayName] = useState('')
  const [identityError, setIdentityError] = useState<string | null>(null)
  const [identitySuccess, setIdentitySuccess] = useState<string | null>(null)
  const [savingName, setSavingName] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [savingPassword, setSavingPassword] = useState(false)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const isLocal = user?.authProvider === 'Local'

  useEffect(() => {
    setDisplayName(user?.displayName ?? '')
  }, [user?.displayName])

  async function saveDisplayName(event: React.FormEvent) {
    event.preventDefault()
    setIdentityError(null)
    setIdentitySuccess(null)
    setSavingName(true)
    try {
      await updateDisplayName(displayName.trim())
      await refresh()
      setIdentitySuccess('Display name saved.')
    } catch (err) {
      setIdentityError(err instanceof Error ? err.message : 'Could not save display name.')
    } finally {
      setSavingName(false)
    }
  }

  async function onChangePassword(event: React.FormEvent) {
    event.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(null)
    setSavingPassword(true)
    try {
      const result = await changePassword(currentPassword, newPassword)
      setPasswordSuccess(result.message)
      setCurrentPassword('')
      setNewPassword('')
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Could not change password.')
    } finally {
      setSavingPassword(false)
    }
  }

  async function confirmDeleteAccount() {
    setDeleteError(null)
    setDeleting(true)
    try {
      await deleteAccount(deleteConfirm)
      clearSession()
      showFlash({ severity: 'success', message: 'Your account has been deleted.' })
      navigate('/sign-in', { replace: true })
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Could not delete account.')
      setDeleting(false)
    }
  }

  return (
    <Stack spacing={{ xs: 2, sm: 2.5 }} sx={{ width: '100%', minWidth: 0 }}>
      <Typography
        variant="h4"
        sx={{ fontWeight: 700, letterSpacing: '-0.02em', fontSize: { xs: '1.5rem', sm: '2.125rem' } }}
      >
        Profile
      </Typography>

      <Stack component="form" spacing={2} onSubmit={saveDisplayName}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Identity</Typography>
        {identityError ? <Alert severity="error">{identityError}</Alert> : null}
        {identitySuccess ? <Alert severity="success">{identitySuccess}</Alert> : null}
        <TextField label="Email" value={user?.email ?? ''} disabled fullWidth />
        <TextField
          label="Display name"
          autoComplete="name"
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          fullWidth
        />
        <PressableButton type="submit" variant="contained" disabled={savingName || !displayName.trim()}>
          Save display name
        </PressableButton>
      </Stack>

      {isLocal ? (
        <Stack component="form" spacing={2} onSubmit={onChangePassword}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Password</Typography>
          {passwordError ? <Alert severity="error">{passwordError}</Alert> : null}
          {passwordSuccess ? <Alert severity="success">{passwordSuccess}</Alert> : null}
          <TextField
            label="Current password"
            type="password"
            autoComplete="current-password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            fullWidth
          />
          <TextField
            label="New password"
            type="password"
            autoComplete="new-password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
          />
          <PressableButton type="submit" variant="contained" disabled={savingPassword}>
            Change password
          </PressableButton>
        </Stack>
      ) : null}

      <Stack spacing={1.5}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'error.main' }}>
          Delete account
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Permanently remove your account and all Spending data. This cannot be undone.
        </Typography>
        <PressableButton color="error" variant="outlined" onClick={() => setDeleteOpen(true)}>
          Delete account
        </PressableButton>
      </Stack>

      <PressableButton variant="outlined" onClick={() => signOut()}>
        Sign out
      </PressableButton>

      <Dialog open={deleteOpen} onClose={() => !deleting && setDeleteOpen(false)}>
        <DialogTitle>Delete your account?</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            <Typography variant="body2">
              All of your Spending data will be removed immediately. Type <strong>DELETE</strong> to confirm.
            </Typography>
            {deleteError ? <Alert severity="error">{deleteError}</Alert> : null}
            <TextField
              label="Confirmation"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              autoComplete="off"
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <PressableButton onClick={() => setDeleteOpen(false)} disabled={deleting}>
            Cancel
          </PressableButton>
          <PressableButton
            color="error"
            variant="contained"
            disabled={deleting || deleteConfirm !== 'DELETE'}
            onClick={() => void confirmDeleteAccount()}
          >
            Delete account
          </PressableButton>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
