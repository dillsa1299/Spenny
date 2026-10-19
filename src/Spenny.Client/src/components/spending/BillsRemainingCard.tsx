// Headline card for the dashboard burndown: remaining of month total, with a paid progress bar.
import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatGbp } from '@/lib/formatGbp'

type BillsRemainingCardProps = {
  remaining: number
  monthTotal: number
}

export function BillsRemainingCard({ remaining, monthTotal }: BillsRemainingCardProps) {
  const paid = Math.max(monthTotal - remaining, 0)
  const paidPercent = monthTotal > 0 ? Math.min((paid / monthTotal) * 100, 100) : 0

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        px: { xs: 2, sm: 2.5 },
        py: { xs: 2, sm: 2.25 },
        mb: { xs: 1.5, sm: 2 },
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ display: 'block', fontWeight: 600, mb: 0.75 }}
      >
        Monthly bills remaining
      </Typography>
      <Stack
        direction="row"
        spacing={0.75}
        sx={{ alignItems: 'baseline', flexWrap: 'wrap', mb: 1.75, fontVariantNumeric: 'tabular-nums' }}
      >
        <Typography
          component="span"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1.5rem', sm: '1.75rem' },
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
          }}
        >
          {formatGbp(remaining)}
        </Typography>
        <Typography component="span" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
          / {formatGbp(monthTotal)}
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={Math.round(paidPercent)}
        aria-label="Paid this month"
        sx={{
          height: 6,
          borderRadius: 3,
          bgcolor: 'action.hover',
          '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: 'success.main' },
        }}
      />
      <Stack direction="row" sx={{ justifyContent: 'space-between', mt: 1.25 }}>
        <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatGbp(paid)} paid
        </Typography>
        <Typography variant="body2" color="success.main" sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {paidPercent.toFixed(1)}% paid
        </Typography>
      </Stack>
    </Box>
  )
}
