// Full-month occurrence rows for the Spending screen, grouped by effective date like the dashboard Coming up list.
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { SpendingOccurrenceDto, SpendingSeriesDto } from '@/api/spendingTypes'
import { categoryLabel, frequencyLabel } from '@/api/spendingTypes'
import { formatCalendarDay } from '@/lib/formatCalendarDay'
import { formatGbp } from '@/lib/formatGbp'
import { groupOccurrencesByDate } from '@/spending/groupOccurrencesByDate'

type OccurrenceListProps = {
  occurrences: SpendingOccurrenceDto[]
  series: SpendingSeriesDto[]
  emptyMessage: string
  onSelect: (occurrence: SpendingOccurrenceDto) => void
}

export function OccurrenceList({ occurrences, series, emptyMessage, onSelect }: OccurrenceListProps) {
  if (occurrences.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ py: 2 }}>
        {emptyMessage}
      </Typography>
    )
  }

  const frequencyBySeriesId = new Map(series.map((s) => [s.id, s.frequency]))
  const detailLabel = (item: SpendingOccurrenceDto) => {
    const frequency = frequencyBySeriesId.get(item.seriesId)
    const category = categoryLabel(item.category)
    return frequency === undefined ? category : `${frequencyLabel(frequency)} · ${category}`
  }

  return (
    <Stack spacing={1.5} sx={{ width: '100%' }}>
      {groupOccurrencesByDate(occurrences).map((group) => (
        <Stack key={group.effectiveDate} spacing={0.25}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              fontSize: { xs: '0.75rem', sm: '0.8125rem' },
              color: 'text.secondary',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {formatCalendarDay(group.effectiveDate)}
          </Typography>
          <List disablePadding>
            {group.items.map((item) => (
              <ListItemButton
                key={`${item.seriesId}-${item.occurrenceDate}`}
                onClick={() => onSelect(item)}
                sx={{
                  borderRadius: 1,
                  mb: 0.25,
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1fr) auto',
                  columnGap: 1,
                  alignItems: 'start',
                  width: '100%',
                }}
              >
                <ListItemText
                  primary={item.name}
                  secondary={detailLabel(item)}
                  slotProps={{
                    primary: { sx: { fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } } },
                    secondary: {
                      sx: { color: 'text.secondary', fontSize: { xs: '0.75rem', sm: '0.875rem' } },
                    },
                  }}
                  sx={{ minWidth: 0, m: 0 }}
                />
                <Typography
                  sx={{
                    color: '#e63946',
                    fontWeight: 600,
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    fontVariantNumeric: 'tabular-nums',
                    flexShrink: 0,
                  }}
                >
                  {formatGbp(item.amount)}
                </Typography>
              </ListItemButton>
            ))}
          </List>
        </Stack>
      ))}
    </Stack>
  )
}
