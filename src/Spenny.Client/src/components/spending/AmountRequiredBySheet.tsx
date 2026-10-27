// Bottom sheet: pick a future target date and show spending due after today through that date.
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Drawer from '@mui/material/Drawer'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { CalendarRange, ClockArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { fetchAmountRequiredBy } from '@/api/spendingApi'
import { BottomSheetHandle, BottomSheetHeader } from '@/components/BottomSheetChrome'
import { PressableButton } from '@/components/PressableButton'
import { formatCalendarDay } from '@/lib/formatCalendarDay'
import { formatGbp } from '@/lib/formatGbp'
import {
  bottomSheetBackdropSx,
  bottomSheetPaperSx,
  glassPanelSx,
  pillChipSx,
} from '@/theme/surfaces'

type AmountRequiredBySheetProps = {
  open: boolean
  onClose: () => void
  asOfDate: string
}

function addDaysIso(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function endOfMonthIso(isoDate: string): string {
  const [y, m] = isoDate.split('-').map(Number)
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate()
  return `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
}

function presetsFor(asOfDate: string): { label: string; date: string }[] {
  const endOfMonth = endOfMonthIso(asOfDate)
  const inOneWeek = addDaysIso(asOfDate, 7)
  const inTwoWeeks = addDaysIso(asOfDate, 14)
  const items = [
    { label: 'In 1 week', date: inOneWeek },
    { label: 'In 2 weeks', date: inTwoWeeks },
  ]
  if (endOfMonth > asOfDate) {
    items.unshift({ label: 'Month end', date: endOfMonth })
  }
  return items
}

export function AmountRequiredBySheet({ open, onClose, asOfDate }: AmountRequiredBySheetProps) {
  const minDate = addDaysIso(asOfDate, 1)
  const presets = presetsFor(asOfDate)
  const [targetDate, setTargetDate] = useState('')
  const [total, setTotal] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [helperText, setHelperText] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    if (!targetDate) {
      setTotal(null)
      setError(null)
      setHelperText(null)
      setLoading(false)
      return
    }

    if (targetDate <= asOfDate) {
      setTotal(null)
      setError(null)
      setHelperText('Choose a date after today.')
      setLoading(false)
      return
    }

    setHelperText(null)
    let cancelled = false
    setLoading(true)
    setError(null)

    void fetchAmountRequiredBy(targetDate)
      .then((result) => {
        if (!cancelled) {
          setTotal(result.total)
          setLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setTotal(null)
          setLoading(false)
          setError(err instanceof Error ? err.message : 'Could not load amount required.')
        }
      })

    return () => {
      cancelled = true
    }
  }, [targetDate, asOfDate, open])

  const hasResult = !loading && total !== null
  const windowLabel =
    targetDate && targetDate > asOfDate
      ? `Due after today through ${formatCalendarDay(targetDate)}`
      : 'Choose when you need the money by'

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: { sx: bottomSheetBackdropSx },
        paper: { sx: bottomSheetPaperSx },
      }}
    >
      <BottomSheetHandle />
      <BottomSheetHeader
        icon={<ClockArrowRight size={22} strokeWidth={2.25} aria-hidden />}
        title="Amount required by"
        subtitle={windowLabel}
      />

      <Box
        sx={{
          ...glassPanelSx,
          borderRadius: 3,
          px: 2.25,
          py: 2.5,
          mb: 2,
          textAlign: 'center',
          minHeight: 112,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.75,
        }}
      >
        {loading && <CircularProgress size={28} aria-label="Loading amount required" />}
        {!loading && hasResult && (
          <Typography
            key={total}
            sx={{
              fontWeight: 700,
              fontSize: { xs: '2.25rem', sm: '2.75rem' },
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              fontVariantNumeric: 'tabular-nums',
              animation: 'amountReveal 280ms ease-out',
              '@keyframes amountReveal': {
                from: { opacity: 0, transform: 'scale(0.96) translateY(6px)' },
                to: { opacity: 1, transform: 'scale(1) translateY(0)' },
              },
              '@media (prefers-reduced-motion: reduce)': {
                animation: 'none',
              },
            }}
          >
            {formatGbp(total)}
          </Typography>
        )}
        {!loading && !targetDate && (
          <>
            <CalendarRange size={28} strokeWidth={1.75} aria-hidden style={{ opacity: 0.55 }} />
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 260 }}>
              Pick a deadline to see what you need to cover.
            </Typography>
          </>
        )}
        {!loading && helperText && (
          <Typography variant="body2" color="error.main">
            {helperText}
          </Typography>
        )}
        {!loading && error && (
          <Typography variant="body2" color="error.main">
            {error}
          </Typography>
        )}
        {hasResult && total === 0 && (
          <Typography variant="body2" color="text.secondary">
            Nothing due in this window
          </Typography>
        )}
      </Box>

      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 1.75 }}>
        {presets.map((preset) => {
          const selected = targetDate === preset.date
          return (
            <PressableButton
              key={preset.date}
              size="small"
              variant={selected ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => setTargetDate(preset.date)}
              sx={{
                ...(!selected ? pillChipSx : {}),
                borderRadius: 999,
                textTransform: 'none',
                fontWeight: 600,
                px: 1.5,
                ...(selected
                  ? {
                      bgcolor: '#52b788',
                      '&:hover': { bgcolor: '#40916c' },
                    }
                  : {
                      color: 'text.primary',
                      borderColor: 'rgba(255,255,255,0.16)',
                    }),
              }}
            >
              {preset.label}
            </PressableButton>
          )
        })}
      </Stack>

      <TextField
        label="Or pick a date"
        type="date"
        value={targetDate}
        onChange={(e) => setTargetDate(e.target.value)}
        error={Boolean(helperText)}
        fullWidth
        size="small"
        slotProps={{
          inputLabel: { shrink: true },
          htmlInput: { min: minDate },
        }}
        sx={{ mb: 2 }}
      />

      <PressableButton
        fullWidth
        variant="contained"
        color="primary"
        onClick={onClose}
        sx={{
          py: 1.25,
          borderRadius: 3,
          fontWeight: 700,
          textTransform: 'none',
          bgcolor: '#52b788',
          '&:hover': { bgcolor: '#40916c' },
        }}
      >
        Done
      </PressableButton>
    </Drawer>
  )
}
