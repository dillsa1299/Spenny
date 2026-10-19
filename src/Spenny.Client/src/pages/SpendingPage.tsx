// Spending list for the selected month with add/edit series sheet.
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Fab from '@mui/material/Fab'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Plus } from 'lucide-react'
import { useCallback, useState } from 'react'
import { MonthSelector } from '@/components/MonthSelector'
import { OccurrenceList } from '@/components/spending/OccurrenceList'
import { SpendingSeriesSheet } from '@/components/spending/SpendingSeriesSheet'
import { PressableButton } from '@/components/PressableButton'
import {
  createSpendingSeries,
  deleteSpendingSeries,
  updateSpendingSeries,
} from '@/api/spendingApi'
import type { SpendingOccurrenceDto, SpendingSeriesDto, SpendingSeriesWrite } from '@/api/spendingTypes'
import { useSelectedMonth } from '@/month/SelectedMonthContext'
import { useSpendingData } from '@/spending/useSpendingData'

export function SpendingPage() {
  const { selectedMonth } = useSelectedMonth()
  const [revision, setRevision] = useState(0)
  const { month, series, loading, error } = useSpendingData(selectedMonth, revision)

  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetMode, setSheetMode] = useState<'create' | 'edit'>('create')
  const [editingSeries, setEditingSeries] = useState<SpendingSeriesDto | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const bump = useCallback(() => setRevision((r) => r + 1), [])

  const openCreate = () => {
    setSheetMode('create')
    setEditingSeries(null)
    setSheetOpen(true)
  }

  const openEdit = (occurrence: SpendingOccurrenceDto) => {
    const template = series.find((s) => s.id === occurrence.seriesId)
    if (!template) {
      return
    }
    setSheetMode('edit')
    setEditingSeries(template)
    setSheetOpen(true)
  }

  const saveSeries = async (body: SpendingSeriesWrite) => {
    setSaving(true)
    try {
      if (sheetMode === 'create') {
        await createSpendingSeries(body)
      } else if (editingSeries) {
        await updateSpendingSeries(editingSeries.id, body)
      }
      setSheetOpen(false)
      bump()
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!editingSeries) {
      return
    }
    setSaving(true)
    try {
      await deleteSpendingSeries(editingSeries.id)
      setDeleteOpen(false)
      setSheetOpen(false)
      bump()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Stack spacing={{ xs: 2, sm: 2.5 }} sx={{ position: 'relative', pb: 8, width: '100%', minWidth: 0 }}>
      <Typography
        variant="h4"
        sx={{ fontWeight: 700, letterSpacing: '-0.02em', fontSize: { xs: '1.5rem', sm: '2.125rem' } }}
      >
        Spending
      </Typography>
      <MonthSelector />

      {loading && (
        <Stack sx={{ alignItems: 'center', py: 4 }}>
          <CircularProgress size={32} aria-label="Loading spending" />
        </Stack>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {month && !loading && (
        <OccurrenceList
          occurrences={month.occurrences}
          series={series}
          emptyMessage="No spending this month. Add a bill or subscription to get started."
          onSelect={openEdit}
        />
      )}

      <Fab
        color="primary"
        aria-label="Add spending"
        onClick={openCreate}
        sx={{
          position: 'fixed',
          right: 16,
          bottom: 88,
          bgcolor: '#52b788',
          '&:hover': { bgcolor: '#40916c' },
        }}
      >
        <Plus aria-hidden />
      </Fab>

      <SpendingSeriesSheet
        open={sheetOpen}
        mode={sheetMode}
        initial={editingSeries}
        saving={saving}
        onClose={() => setSheetOpen(false)}
        onSave={saveSeries}
        onDelete={sheetMode === 'edit' ? async () => setDeleteOpen(true) : undefined}
      />

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete this spending?</DialogTitle>
        <DialogContent>
          This removes the series and all its scheduled dates. This cannot be undone.
        </DialogContent>
        <DialogActions>
          <PressableButton onClick={() => setDeleteOpen(false)}>Cancel</PressableButton>
          <PressableButton color="error" variant="contained" disabled={saving} onClick={() => void confirmDelete()}>
            Delete
          </PressableButton>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
