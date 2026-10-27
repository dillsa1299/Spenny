// Bottom sheet to edit or remove a single occurrence via an exception record.
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { CalendarClock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { BottomSheetHandle, BottomSheetHeader } from '@/components/BottomSheetChrome'
import { PressableButton } from '@/components/PressableButton'
import { formatCalendarDay } from '@/lib/formatCalendarDay'
import { sanitizeAmountInput } from '@/lib/sanitizeAmountInput'
import type { SpendingOccurrenceDto } from '@/api/spendingTypes'
import {
  SPENDING_CATEGORY_OPTIONS,
  type SpendingCategoryValue,
} from '@/api/spendingTypes'
import { bottomSheetBackdropSx, bottomSheetPaperSx, glassPanelSx } from '@/theme/surfaces'

type SpendingExceptionSheetProps = {
  open: boolean
  occurrence: SpendingOccurrenceDto | null
  saving: boolean
  onClose: () => void
  onSave: (occurrence: SpendingOccurrenceDto, body: {
    name: string
    amount: number
    category: SpendingCategoryValue
    description: string | null
  }) => Promise<void>
  onDelete?: () => void
}

type FormState = {
  name: string
  amount: string
  category: number
  description: string
}

type FormErrors = Partial<Record<keyof FormState, string>>

const primaryButtonSx = {
  py: 1.25,
  borderRadius: 3,
  fontWeight: 700,
  textTransform: 'none' as const,
  bgcolor: '#52b788',
  '&:hover': { bgcolor: '#40916c' },
}

function fromOccurrence(occurrence: SpendingOccurrenceDto): FormState {
  return {
    name: occurrence.name,
    amount: String(occurrence.amount),
    category: occurrence.category,
    description: occurrence.description ?? '',
  }
}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {}
  if (!form.name.trim()) {
    errors.name = 'Name is required'
  }
  const amount = Number(form.amount)
  if (!Number.isFinite(amount) || amount <= 0) {
    errors.amount = 'Enter an amount greater than zero'
  }
  return errors
}

export function SpendingExceptionSheet({
  open,
  occurrence,
  saving,
  onClose,
  onSave,
  onDelete,
}: SpendingExceptionSheetProps) {
  const [form, setForm] = useState<FormState>({ name: '', amount: '', category: 0, description: '' })
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (!open || !occurrence) {
      return
    }
    setForm(fromOccurrence(occurrence))
    setErrors({})
  }, [open, occurrence])

  const submit = async () => {
    if (!occurrence) {
      return
    }
    const nextErrors = validate(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }

    await onSave(occurrence, {
      name: form.name.trim(),
      amount: Number(form.amount),
      category: form.category as SpendingCategoryValue,
      description: form.description.trim() ? form.description.trim() : null,
    })
  }

  const subtitle = occurrence
    ? occurrence.effectiveDate !== occurrence.occurrenceDate
      ? `${formatCalendarDay(occurrence.effectiveDate)} · scheduled ${formatCalendarDay(occurrence.occurrenceDate)}`
      : formatCalendarDay(occurrence.effectiveDate)
    : 'Changes apply to this date only'

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: { sx: bottomSheetBackdropSx },
        paper: { sx: { ...bottomSheetPaperSx, overflow: 'auto' } },
      }}
    >
      <BottomSheetHandle />
      <BottomSheetHeader
        icon={<CalendarClock size={22} strokeWidth={2.25} aria-hidden />}
        title="Edit this date"
        subtitle={subtitle}
      />

      <Stack
        spacing={2}
        component="form"
        onSubmit={(e) => {
          e.preventDefault()
          void submit()
        }}
      >
        <Box sx={{ ...glassPanelSx, borderRadius: 3, p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
            {occurrence ? formatCalendarDay(occurrence.effectiveDate) : '—'}
            {occurrence && occurrence.effectiveDate !== occurrence.occurrenceDate
              ? ` (scheduled ${formatCalendarDay(occurrence.occurrenceDate)})`
              : ''}
          </Typography>
          <TextField
            label="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            error={Boolean(errors.name)}
            helperText={errors.name}
            fullWidth
          />
          <TextField
            label="Amount (£)"
            inputMode="decimal"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: sanitizeAmountInput(e.target.value) }))}
            error={Boolean(errors.amount)}
            helperText={errors.amount}
            fullWidth
          />
        </Box>

        <FormControl fullWidth>
          <InputLabel id="exc-category-label">Category</InputLabel>
          <Select
            labelId="exc-category-label"
            label="Category"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: Number(e.target.value) }))}
          >
            {SPENDING_CATEGORY_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Description (optional)"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          multiline
          minRows={2}
          fullWidth
        />

        <Stack direction="row" spacing={1.5} sx={{ pt: 0.5 }}>
          <PressableButton
            variant="contained"
            fullWidth
            disabled={saving}
            onClick={() => void submit()}
            sx={primaryButtonSx}
          >
            Save
          </PressableButton>
          <PressableButton
            variant="outlined"
            fullWidth
            disabled={saving}
            onClick={onClose}
            sx={{
              py: 1.25,
              borderRadius: 3,
              fontWeight: 700,
              textTransform: 'none',
              borderColor: 'rgba(255,255,255,0.16)',
              color: 'text.primary',
            }}
          >
            Cancel
          </PressableButton>
        </Stack>
        {onDelete && (
          <PressableButton color="error" variant="text" disabled={saving} onClick={onDelete}>
            Remove this date
          </PressableButton>
        )}
        {saving && <FormHelperText sx={{ textAlign: 'center' }}>Saving…</FormHelperText>}
      </Stack>
    </Drawer>
  )
}
