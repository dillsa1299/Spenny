// Bottom sheet to create or edit a Spending series template.
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import Drawer from '@mui/material/Drawer'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Pencil, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { BottomSheetHandle, BottomSheetHeader } from '@/components/BottomSheetChrome'
import { PressableButton } from '@/components/PressableButton'
import { sanitizeAmountInput } from '@/lib/sanitizeAmountInput'
import type { SpendingSeriesDto, SpendingSeriesWrite } from '@/api/spendingTypes'
import {
  SPENDING_CATEGORY_OPTIONS,
  SPENDING_FREQUENCY_OPTIONS,
  SpendingCategory,
  SpendingFrequency,
} from '@/api/spendingTypes'
import { bottomSheetBackdropSx, bottomSheetPaperSx, glassPanelSx } from '@/theme/surfaces'

export type SeriesSheetMode = 'create' | 'edit'

type SpendingSeriesSheetProps = {
  open: boolean
  mode: SeriesSheetMode
  initial: SpendingSeriesDto | null
  saving: boolean
  onClose: () => void
  onSave: (body: SpendingSeriesWrite) => Promise<void>
  onDelete?: () => Promise<void>
}

type FormState = {
  name: string
  amount: string
  anchorDate: string
  frequency: number
  category: number
  roundWeekendToFriday: boolean
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

function emptyForm(): FormState {
  const today = new Date()
  const anchor = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  return {
    name: '',
    amount: '',
    anchorDate: anchor,
    frequency: SpendingFrequency.Monthly,
    category: SpendingCategory.General,
    roundWeekendToFriday: true,
    description: '',
  }
}

function fromSeries(series: SpendingSeriesDto): FormState {
  return {
    name: series.name,
    amount: String(series.amount),
    anchorDate: series.anchorDate,
    frequency: series.frequency,
    category: series.category,
    roundWeekendToFriday: series.roundWeekendToFriday,
    description: series.description ?? '',
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
  if (!form.anchorDate) {
    errors.anchorDate = 'Date is required'
  }
  return errors
}

export function SpendingSeriesSheet({
  open,
  mode,
  initial,
  saving,
  onClose,
  onSave,
  onDelete,
}: SpendingSeriesSheetProps) {
  const [form, setForm] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (!open) {
      return
    }
    setForm(mode === 'edit' && initial ? fromSeries(initial) : emptyForm())
    setErrors({})
  }, [open, mode, initial])

  const submit = async () => {
    const nextErrors = validate(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }

    await onSave({
      name: form.name.trim(),
      amount: Number(form.amount),
      anchorDate: form.anchorDate,
      frequency: form.frequency as SpendingSeriesWrite['frequency'],
      category: form.category as SpendingSeriesWrite['category'],
      roundWeekendToFriday: form.roundWeekendToFriday,
      description: form.description.trim() ? form.description.trim() : null,
    })
  }

  const isCreate = mode === 'create'

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
        icon={
          isCreate ? (
            <Plus size={22} strokeWidth={2.25} aria-hidden />
          ) : (
            <Pencil size={22} strokeWidth={2.25} aria-hidden />
          )
        }
        title={isCreate ? 'Add spending' : 'Edit spending'}
        subtitle={
          isCreate
            ? 'Bill, subscription, or one-off cost'
            : initial?.name
              ? `Updating ${initial.name}`
              : 'Update this series'
        }
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
          <TextField
            label="Date"
            type="date"
            value={form.anchorDate}
            onChange={(e) => setForm((f) => ({ ...f, anchorDate: e.target.value }))}
            error={Boolean(errors.anchorDate)}
            helperText={errors.anchorDate}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Box>

        <FormControl fullWidth>
          <InputLabel id="frequency-label">Frequency</InputLabel>
          <Select
            labelId="frequency-label"
            label="Frequency"
            value={form.frequency}
            onChange={(e) => setForm((f) => ({ ...f, frequency: Number(e.target.value) }))}
          >
            {SPENDING_FREQUENCY_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel id="category-label">Category</InputLabel>
          <Select
            labelId="category-label"
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

        <Box
          component="label"
          sx={{
            ...glassPanelSx,
            borderRadius: 3,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 0.5,
            cursor: 'pointer',
            px: 1.5,
            py: 1.25,
            mx: 0,
          }}
        >
          <Checkbox
            checked={form.roundWeekendToFriday}
            onChange={(e) => setForm((f) => ({ ...f, roundWeekendToFriday: e.target.checked }))}
            sx={{ flexShrink: 0, p: 1 }}
          />
          <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0, pt: 0.75 }}>
            <Typography variant="body1" color="text.primary" sx={{ fontWeight: 600 }}>
              Use next UK working day
            </Typography>
            <FormHelperText component="div" sx={{ m: 0, color: 'text.secondary', lineHeight: 1.45 }}>
              If the scheduled date falls on a weekend or UK bank holiday, show it on the next weekday that is not a
              bank holiday.
            </FormHelperText>
          </Stack>
        </Box>

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
        {mode === 'edit' && onDelete && (
          <PressableButton color="error" variant="text" disabled={saving} onClick={() => void onDelete()}>
            Delete series
          </PressableButton>
        )}
        {saving && <FormHelperText sx={{ textAlign: 'center' }}>Saving…</FormHelperText>}
      </Stack>
    </Drawer>
  )
}
