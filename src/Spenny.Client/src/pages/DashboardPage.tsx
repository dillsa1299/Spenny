// Dashboard: month burndown and coming-up list backed by the spending month API.
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { BurndownChart } from '@/components/spending/BurndownChart'
import { ComingUpList } from '@/components/spending/ComingUpList'
import { MonthSelector } from '@/components/MonthSelector'
import { useSelectedMonth } from '@/month/SelectedMonthContext'
import { comingUpEmptyMessage } from '@/spending/comingUpCopy'
import { useSpendingData } from '@/spending/useSpendingData'
import { formatGbp } from '@/lib/formatGbp'

export function DashboardPage() {
  const { selectedMonth } = useSelectedMonth()
  const { month, loading, error } = useSpendingData(selectedMonth, 0)

  return (
    <Stack spacing={2.5}>
      <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
        Dashboard
      </Typography>
      <MonthSelector />

      {loading && (
        <Stack sx={{ alignItems: 'center', py: 4 }}>
          <CircularProgress size={32} aria-label="Loading month data" />
        </Stack>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {month && !loading && (
        <>
          <BurndownChart
            year={month.year}
            month={month.month}
            monthTotal={month.monthTotal}
            burndownSteps={month.burndownSteps}
            showTodayMarker={month.showTodayMarker}
            asOfDate={month.asOfDate}
            remainingAtToday={month.remainingAtToday}
          />
          <Stack spacing={1}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Coming up
            </Typography>
            {month.showTodayMarker && (
              <Typography variant="body2" color="text.secondary">
                {formatGbp(month.remainingAtToday)} still scheduled after today
              </Typography>
            )}
            <ComingUpList
              occurrences={month.occurrences}
              upcomingIds={month.upcomingOccurrenceIds}
              emptyMessage={comingUpEmptyMessage(month)}
            />
          </Stack>
        </>
      )}
    </Stack>
  )
}
