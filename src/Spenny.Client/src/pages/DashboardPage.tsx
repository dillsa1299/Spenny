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
export function DashboardPage() {
  const { selectedMonth } = useSelectedMonth()
  const { month, loading, error } = useSpendingData(selectedMonth, 0)

  return (
    <Stack spacing={{ xs: 2, sm: 2.5 }} sx={{ width: '100%', minWidth: 0 }}>
      <Typography
        variant="h4"
        sx={{ fontWeight: 700, letterSpacing: '-0.02em', fontSize: { xs: '1.5rem', sm: '2.125rem' } }}
      >
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
            occurrences={month.occurrences}
            showTodayMarker={month.showTodayMarker}
            asOfDate={month.asOfDate}
            remainingAtToday={month.remainingAtToday}
          />
          <Stack spacing={0.75}>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1.125rem', sm: '1.375rem' } }}>
              Coming up
            </Typography>
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
