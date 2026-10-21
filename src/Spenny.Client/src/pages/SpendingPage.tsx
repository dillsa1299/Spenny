// Spending list for the selected month with add/edit series and occurrence exceptions.
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
import { SpendingExceptionSheet } from '@/components/spending/SpendingExceptionSheet'
import { SpendingScopeDialog } from '@/components/spending/SpendingScopeDialog'
import { SpendingSeriesSheet } from '@/components/spending/SpendingSeriesSheet'
import { PressableButton } from '@/components/PressableButton'
import {
  createSpendingSeries,
  deleteSpendingSeries,
  skipSpendingOccurrence,
  updateSpendingSeries,
  upsertSpendingException,
} from '@/api/spendingApi'
import type { SpendingOccurrenceDto, SpendingSeriesDto, SpendingSeriesWrite } from '@/api/spendingTypes'
import { useSelectedMonth } from '@/month/SelectedMonthContext'
import { isRecurringSeries } from '@/spending/isRecurringSeries'
import { useSpendingData } from '@/spending/useSpendingData'

export function SpendingPage() {
  const { selectedMonth } = useSelectedMonth()
  const [revision, setRevision] = useState(0)
  const { month, series, loading, error } = useSpendingData(selectedMonth, revision)

  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetMode, setSheetMode] = useState<'create' | 'edit'>('create')
  const [editingSeries, setEditingSeries] = useState<SpendingSeriesDto | null>(null)
  const [selectedOccurrence, setSelectedOccurrence] = useState<SpendingOccurrenceDto | null>(null)
  const [scopeOpen, setScopeOpen] = useState(false)
  const [exceptionSheetOpen, setExceptionSheetOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteOccurrenceOpen, setDeleteOccurrenceOpen] = useState(false)
  const [seriesSaveConfirmOpen, setSeriesSaveConfirmOpen] = useState(false)
  const [pendingSeriesWrite, setPendingSeriesWrite] = useState<SpendingSeriesWrite | null>(null)

  const bump = useCallback(() => setRevision((r) => r + 1), [])

  const openCreate = () => {
    setSheetMode('create')
    setEditingSeries(null)
    setSelectedOccurrence(null)
    setSheetOpen(true)
  }

  const openSeriesEdit = (template: SpendingSeriesDto) => {
    setSheetMode('edit')
    setEditingSeries(template)
    setSheetOpen(true)
  }

  const openEdit = (occurrence: SpendingOccurrenceDto) => {
    const template = series.find((s) => s.id === occurrence.seriesId)
    if (!template) {
      return
    }
    setSelectedOccurrence(occurrence)
    if (isRecurringSeries(template.frequency)) {
      setScopeOpen(true)
      return
    }
    openSeriesEdit(template)
  }

  const saveSeries = async (body: SpendingSeriesWrite) => {
    if (sheetMode === 'edit' && editingSeries && isRecurringSeries(editingSeries.frequency)) {
      setPendingSeriesWrite(body)
      setSeriesSaveConfirmOpen(true)
      return
    }
    await commitSeriesSave(body)
  }

  const commitSeriesSave = async (body: SpendingSeriesWrite) => {
    setSaving(true)
    try {
      if (sheetMode === 'create') {
        await createSpendingSeries(body)
      } else if (editingSeries) {
        await updateSpendingSeries(editingSeries.id, body)
      }
      setSheetOpen(false)
      setSeriesSaveConfirmOpen(false)
      setPendingSeriesWrite(null)
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

  const saveException = async (
    occurrence: SpendingOccurrenceDto,
    body: {
      name: string
      amount: number
      category: SpendingOccurrenceDto['category']
      description: string | null
    },
  ) => {
    setSaving(true)
    try {
      await upsertSpendingException(occurrence.seriesId, occurrence.occurrenceDate, {
        isSkipped: false,
        name: body.name,
        amount: body.amount,
        category: body.category,
        description: body.description,
      })
      setExceptionSheetOpen(false)
      setSelectedOccurrence(null)
      bump()
    } finally {
      setSaving(false)
    }
  }

  const confirmDeleteOccurrence = async () => {
    if (!selectedOccurrence) {
      return
    }
    setSaving(true)
    try {
      await skipSpendingOccurrence(selectedOccurrence.seriesId, selectedOccurrence.occurrenceDate)
      setDeleteOccurrenceOpen(false)
      setExceptionSheetOpen(false)
      setSelectedOccurrence(null)
      bump()
    } finally {
      setSaving(false)
    }
  }

  const seriesDeleteMessage = editingSeries && isRecurringSeries(editingSeries.frequency)
    ? 'This removes the entire series and all its scheduled dates. This cannot be undone.'
    : 'This removes the spending and its scheduled date. This cannot be undone.'

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

      <SpendingScopeDialog
        open={scopeOpen}
        onClose={() => {
          setScopeOpen(false)
          setSelectedOccurrence(null)
        }}
        onThisOccurrence={() => {
          setScopeOpen(false)
          setExceptionSheetOpen(true)
        }}
        onEntireSeries={() => {
          setScopeOpen(false)
          const template = series.find((s) => s.id === selectedOccurrence?.seriesId)
          if (template) {
            openSeriesEdit(template)
          }
        }}
      />

      <SpendingExceptionSheet
        open={exceptionSheetOpen}
        occurrence={selectedOccurrence}
        saving={saving}
        onClose={() => {
          setExceptionSheetOpen(false)
          setSelectedOccurrence(null)
        }}
        onSave={saveException}
        onDelete={() => setDeleteOccurrenceOpen(true)}
      />

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
        <DialogTitle>
          {editingSeries && isRecurringSeries(editingSeries.frequency)
            ? 'Delete entire series?'
            : 'Delete this spending?'}
        </DialogTitle>
        <DialogContent>{seriesDeleteMessage}</DialogContent>
        <DialogActions>
          <PressableButton onClick={() => setDeleteOpen(false)}>Cancel</PressableButton>
          <PressableButton color="error" variant="contained" disabled={saving} onClick={() => void confirmDelete()}>
            Delete series
          </PressableButton>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOccurrenceOpen} onClose={() => setDeleteOccurrenceOpen(false)}>
        <DialogTitle>Remove this date?</DialogTitle>
        <DialogContent>
          Only this scheduled date is removed. Other dates in the series stay the same.
        </DialogContent>
        <DialogActions>
          <PressableButton onClick={() => setDeleteOccurrenceOpen(false)}>Cancel</PressableButton>
          <PressableButton
            color="error"
            variant="contained"
            disabled={saving}
            onClick={() => void confirmDeleteOccurrence()}
          >
            Remove
          </PressableButton>
        </DialogActions>
      </Dialog>

      <Dialog open={seriesSaveConfirmOpen} onClose={() => setSeriesSaveConfirmOpen(false)}>
        <DialogTitle>Update entire series?</DialogTitle>
        <DialogContent>
          These changes apply to all scheduled dates in this series, not just the date you tapped.
        </DialogContent>
        <DialogActions>
          <PressableButton onClick={() => setSeriesSaveConfirmOpen(false)}>Cancel</PressableButton>
          <PressableButton
            variant="contained"
            disabled={saving || !pendingSeriesWrite}
            onClick={() => pendingSeriesWrite && void commitSeriesSave(pendingSeriesWrite)}
          >
            Update series
          </PressableButton>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
