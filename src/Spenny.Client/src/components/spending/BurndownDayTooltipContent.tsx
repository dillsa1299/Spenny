// Daily summary body for the burndown axis tooltip: balances and payments for one calendar day.
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { formatCalendarDay } from '@/lib/formatCalendarDay'
import { formatGbp } from '@/lib/formatGbp'
import type { BurndownDaySummary } from '@/spending/burndownDaySummary'

type BurndownDayTooltipContentProps = {
  summary: BurndownDaySummary
}

function paymentCountLabel(count: number): string {
  return count === 1 ? '1 payment' : `${count} payments`
}

const rowSx = { justifyContent: 'space-between', alignItems: 'baseline', gap: 1.5 } as const
const amountSx = {
  fontSize: '0.75rem',
  fontWeight: 700,
  fontVariantNumeric: 'tabular-nums',
  flexShrink: 0,
} as const
const labelSx = { fontSize: '0.75rem' } as const

export function BurndownDayTooltipContent({ summary }: BurndownDayTooltipContentProps) {
  const scheduledLabel =
    summary.paymentsTotal > 0 ? `\u2212${formatGbp(summary.paymentsTotal)}` : formatGbp(0)

  return (
    <Paper
      elevation={4}
      sx={(theme) => ({
        px: 1.25,
        py: 1,
        minWidth: 180,
        maxWidth: 260,
        borderRadius: 1.5,
        // Translucent so the burndown line behind the tooltip stays visible.
        bgcolor: alpha(theme.palette.background.paper, 0.5),
        backdropFilter: 'blur(4px)',
        border: '1px solid',
        borderColor: 'divider',
      })}
    >
      <Stack direction="row" sx={rowSx}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>
          {formatCalendarDay(summary.isoDate)}
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: '0.6875rem', fontVariantNumeric: 'tabular-nums' }}>
          {paymentCountLabel(summary.paymentCount)}
        </Typography>
      </Stack>

      <Divider sx={{ my: 0.75 }} />

      <Stack spacing={0.25}>
        <Stack direction="row" sx={rowSx}>
          <Typography color="text.secondary" sx={labelSx}>
            Starting balance
          </Typography>
          <Typography sx={amountSx}>{formatGbp(summary.startingBalance)}</Typography>
        </Stack>
        <Stack direction="row" sx={rowSx}>
          <Typography color="text.secondary" sx={labelSx}>
            Payments scheduled
          </Typography>
          <Typography sx={{ ...amountSx, color: 'secondary.main' }}>{scheduledLabel}</Typography>
        </Stack>
      </Stack>

      <Divider sx={{ my: 0.75 }} />

      <Stack direction="row" sx={rowSx}>
        <Typography sx={{ ...labelSx, fontWeight: 700 }}>Remaining afterwards</Typography>
        <Typography sx={{ ...amountSx, fontSize: '0.875rem' }}>{formatGbp(summary.remainingAfter)}</Typography>
      </Stack>

      {summary.payments.length > 0 && (
        <Stack spacing={0.125} sx={{ mt: 0.75 }}>
          {summary.payments.map((p) => (
            <Typography
              key={`${p.seriesId}-${p.occurrenceDate}`}
              color="text.secondary"
              sx={{ fontSize: '0.6875rem', wordBreak: 'break-word', fontVariantNumeric: 'tabular-nums' }}
            >
              {`${p.name} · ${formatGbp(p.amount)}`}
            </Typography>
          ))}
        </Stack>
      )}
    </Paper>
  )
}
