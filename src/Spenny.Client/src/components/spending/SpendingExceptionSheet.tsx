// Bottom sheet to edit or remove a single occurrence via an exception record.
import Drawer from '@mui/material/Drawer'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import { PressableButton } from '@/components/PressableButton'
import { sanitizeAmountInput } from '@/lib/sanitizeAmountInput'
import type { SpendingOccurrenceDto } from '@/api/spendingTypes'
import {
  SPENDING_CATEGORY_OPTIONS,
  type SpendingCategoryValue,
} from '@/api/spendingTypes'

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

  const dateLabel = occurrence
    ? occurrence.effectiveDate !== occurrence.occurrenceDate
      ? `${occurrence.effectiveDate} (scheduled ${occurrence.occurrenceDate})`
      : occurrence.effectiveDate
    : ''

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
        Edit this date
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
          label="Date"
          value={dateLabel}
          fullWidth
          disabled
          slotProps={{ inputLabel: { shrink: true } }}
        />
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
        <Stack direction="row" spacing={1.5} sx={{ pt: 1 }}>
          <PressableButton variant="contained" fullWidth disabled={saving} onClick={() => void submit()}>
            Save
          </PressableButton>
          <PressableButton variant="outlined" fullWidth disabled={saving} onClick={onClose}>
            Cancel
          </PressableButton>
        </Stack>
        {onDelete && (
          <PressableButton color="error" variant="text" disabled={saving} onClick={onDelete}>
            Remove this date
          </PressableButton>
        )}
        {saving && (
          <FormHelperText sx={{ textAlign: 'center' }}>Saving…</FormHelperText>
        )}
      </Stack>
    </Drawer>
  )
}
