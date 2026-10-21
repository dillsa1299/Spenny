// Chooses edit/delete scope for a recurring occurrence: this date vs entire series.
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { PressableButton } from '@/components/PressableButton'

type SpendingScopeDialogProps = {
  open: boolean
  onClose: () => void
  onThisOccurrence: () => void
  onEntireSeries: () => void
}

export function SpendingScopeDialog({
  open,
  onClose,
  onThisOccurrence,
  onEntireSeries,
}: SpendingScopeDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit spending</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          This item repeats. What do you want to change?
        </Typography>
        <Stack spacing={1.5}>
          <PressableButton variant="contained" fullWidth onClick={onThisOccurrence}>
            This date only
          </PressableButton>
          <PressableButton variant="outlined" fullWidth onClick={onEntireSeries}>
            Entire series
          </PressableButton>
          <PressableButton variant="text" fullWidth onClick={onClose}>
            Cancel
          </PressableButton>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
