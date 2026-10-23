// Bottom sheet to create or edit a Spending series template.
import Checkbox from '@mui/material/Checkbox'
import Drawer from '@mui/material/Drawer'
import FormControl from '@mui/material/FormControl'
import Box from '@mui/material/Box'
import FormHelperText from '@mui/material/FormHelperText'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import { PressableButton } from '@/components/PressableButton'
import type { SpendingSeriesDto, SpendingSeriesWrite } from '@/api/spendingTypes'
import {
  SPENDING_CATEGORY_OPTIONS,
  SPENDING_FREQUENCY_OPTIONS,
  SpendingCategory,
  SpendingFrequency,
} from '@/api/spendingTypes'

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

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            px: 2,
            pt: 2,
            pb: 3,
            maxHeight: '90vh',
          },
        },
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        {mode === 'create' ? 'Add spending' : 'Edit spending'}
      </Typography>
      <Stack
        spacing={2}
        component="form"
        onSubmit={(e) => {
          e.preventDefault()
          void submit()
        }}
      >
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
          onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
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
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            cursor: 'pointer',
            mx: 0,
          }}
        >
          <Checkbox
            checked={form.roundWeekendToFriday}
            onChange={(e) => setForm((f) => ({ ...f, roundWeekendToFriday: e.target.checked }))}
            sx={{ flexShrink: 0, p: 1 }}
          />
          <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body1" color="text.primary">
              Use previous UK working day
            </Typography>
            <FormHelperText component="div" sx={{ m: 0, color: 'text.secondary', lineHeight: 1.45 }}>
              If the scheduled date falls on a weekend or UK bank holiday, show it on the previous weekday that is
              not a bank holiday.
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
        <Stack direction="row" spacing={1.5} sx={{ pt: 1 }}>
          <PressableButton variant="contained" fullWidth disabled={saving} onClick={() => void submit()}>
            Save
          </PressableButton>
          <PressableButton variant="outlined" fullWidth disabled={saving} onClick={onClose}>
            Cancel
          </PressableButton>
        </Stack>
        {mode === 'edit' && onDelete && (
          <PressableButton color="error" variant="text" disabled={saving} onClick={() => void onDelete()}>
            Delete series
          </PressableButton>
        )}
        {saving && (
          <FormHelperText sx={{ textAlign: 'center' }}>Saving…</FormHelperText>
        )}
      </Stack>
    </Drawer>
  )
}
