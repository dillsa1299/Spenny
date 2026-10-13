// Prev/next controls for the shared selected month (Dashboard and Spending).
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PressableButton } from '@/components/PressableButton'
import { formatMonthLabel } from '@/lib/monthKey'
import { useSelectedMonth } from '@/month/SelectedMonthContext'

export function MonthSelector() {
  const { selectedMonth, goToPreviousMonth, goToNextMonth } = useSelectedMonth()

  return (
    <Stack direction="row" spacing={1} sx={{ width: '100%', alignItems: 'center' }}>
      <PressableButton
        variant="outlined"
        size="small"
        onClick={goToPreviousMonth}
        aria-label="Previous month"
        sx={{ minWidth: 44, px: 1 }}
      >
        <ChevronLeft size={20} aria-hidden />
      </PressableButton>
      <Typography
        variant="subtitle1"
        component="p"
        sx={{ flex: 1, textAlign: 'center', fontWeight: 600, letterSpacing: '-0.01em' }}
      >
        {formatMonthLabel(selectedMonth)}
      </Typography>
      <PressableButton
        variant="outlined"
        size="small"
        onClick={goToNextMonth}
        aria-label="Next month"
        sx={{ minWidth: 44, px: 1 }}
      >
        <ChevronRight size={20} aria-hidden />
      </PressableButton>
    </Stack>
  )
}
