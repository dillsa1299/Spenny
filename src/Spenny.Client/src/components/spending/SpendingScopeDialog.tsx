// Chooses edit/delete scope for a recurring occurrence: this date vs entire series.
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Layers } from 'lucide-react'
import { BottomSheetHeader } from '@/components/BottomSheetChrome'
import { PressableButton } from '@/components/PressableButton'
import { glassPanelSx } from '@/theme/surfaces'

type SpendingScopeDialogProps = {
  open: boolean
  onClose: () => void
  onThisOccurrence: () => void
  onEntireSeries: () => void
}

const primaryButtonSx = {
  py: 1.25,
  borderRadius: 3,
  fontWeight: 700,
  textTransform: 'none' as const,
  bgcolor: '#52b788',
  '&:hover': { bgcolor: '#40916c' },
}

export function SpendingScopeDialog({
  open,
  onClose,
  onThisOccurrence,
  onEntireSeries,
}: SpendingScopeDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(4px)',
            '@media (prefers-reduced-transparency: reduce)': {
              backdropFilter: 'none',
            },
          },
        },
        paper: {
          sx: {
            ...glassPanelSx,
            borderRadius: 4,
            backgroundColor: 'rgba(22, 27, 34, 0.94)',
            backdropFilter: 'blur(28px) saturate(180%)',
            mx: 2,
            width: '100%',
            maxWidth: 400,
            '@media (prefers-reduced-transparency: reduce)': {
              backdropFilter: 'none',
              backgroundColor: 'background.paper',
            },
          },
        },
      }}
    >
      <DialogContent sx={{ pt: 2.5, pb: 2.5, px: 2.5 }}>
        <BottomSheetHeader
          icon={<Layers size={22} strokeWidth={2.25} aria-hidden />}
          title="Edit spending"
          subtitle="This item repeats. What do you want to change?"
        />
        <Stack spacing={1.25}>
          <PressableButton variant="contained" fullWidth onClick={onThisOccurrence} sx={primaryButtonSx}>
            This date only
          </PressableButton>
          <PressableButton
            variant="outlined"
            fullWidth
            onClick={onEntireSeries}
            sx={{
              py: 1.25,
              borderRadius: 3,
              fontWeight: 700,
              textTransform: 'none',
              borderColor: 'rgba(255,255,255,0.16)',
              color: 'text.primary',
            }}
          >
            Entire series
          </PressableButton>
          <PressableButton
            variant="text"
            fullWidth
            onClick={onClose}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Cancel
          </PressableButton>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
