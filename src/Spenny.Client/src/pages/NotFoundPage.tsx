// Non-revealing missing-page state for routes the user cannot access.
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

export function NotFoundPage() {
  return (
    <Stack spacing={1} sx={{ py: 4, textAlign: 'center' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
        Page not found
      </Typography>
      <Typography color="text.secondary">
        This page does not exist or is not available.
      </Typography>
    </Stack>
  )
}
