// Shared body for burndown axis tooltip: ordinal date and payments on that day.
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { SpendingOccurrenceDto } from '@/api/spendingTypes'
import { formatGbp } from '@/lib/formatGbp'
import { formatOrdinalDay } from '@/lib/formatOrdinalDay'

type BurndownDayTooltipContentProps = {
  isoDate: string
  payments: SpendingOccurrenceDto[]
}

export function BurndownDayTooltipContent({ isoDate, payments }: BurndownDayTooltipContentProps) {
  return (
    <Paper
      elevation={4}
      sx={{
        px: 1.5,
        py: 1,
        maxWidth: 280,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
        {formatOrdinalDay(isoDate)}
      </Typography>
      {payments.length === 0 ? (
        <Typography variant="caption" color="text.secondary">
          No spending this day
        </Typography>
      ) : (
        <Stack spacing={0.5}>
          {payments.map((p) => (
            <Stack
              key={`${p.seriesId}-${p.occurrenceDate}`}
              direction="row"
              spacing={1}
              sx={{ justifyContent: 'space-between', gap: 1 }}
            >
              <Typography variant="caption" sx={{ flex: 1, minWidth: 0, wordBreak: 'break-word' }}>
                {p.name}
              </Typography>
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: '#e63946', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}
              >
                {formatGbp(p.amount)}
              </Typography>
            </Stack>
          ))}
        </Stack>
      )}
    </Paper>
  )
}
