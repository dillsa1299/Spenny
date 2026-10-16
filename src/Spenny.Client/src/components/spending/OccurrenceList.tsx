// Full-month occurrence rows for the Spending screen.
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import type { SpendingOccurrenceDto } from '@/api/spendingTypes'
import { categoryLabel } from '@/api/spendingTypes'
import { formatGbp } from '@/lib/formatGbp'

type OccurrenceListProps = {
  occurrences: SpendingOccurrenceDto[]
  emptyMessage: string
  onSelect: (occurrence: SpendingOccurrenceDto) => void
}

export function OccurrenceList({ occurrences, emptyMessage, onSelect }: OccurrenceListProps) {
  if (occurrences.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ py: 2 }}>
        {emptyMessage}
      </Typography>
    )
  }

  return (
    <List disablePadding>
      {occurrences.map((item) => (
        <ListItemButton
          key={`${item.seriesId}-${item.occurrenceDate}`}
          onClick={() => onSelect(item)}
          sx={{ borderRadius: 1, mb: 0.5 }}
        >
          <ListItemText
            primary={item.name}
            secondary={`${item.effectiveDate} · ${categoryLabel(item.category)}`}
            slotProps={{
              primary: { sx: { fontWeight: 600 } },
              secondary: { sx: { color: 'text.secondary' } },
            }}
          />
          <Typography sx={{ color: '#e63946', fontWeight: 600 }}>{formatGbp(item.amount)}</Typography>
        </ListItemButton>
      ))}
    </List>
  )
}
