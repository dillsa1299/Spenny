// Spending list placeholder; shares selected month with Dashboard via SelectedMonthProvider.
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { MonthSelector } from '@/components/MonthSelector'

export function SpendingPage() {
  return (
    <Stack spacing={2.5}>
      <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
        Spending
      </Typography>
      <MonthSelector />
      <Typography color="text.secondary">
        Your spending list for this month will appear here in a later ticket.
      </Typography>
    </Stack>
  )
}
