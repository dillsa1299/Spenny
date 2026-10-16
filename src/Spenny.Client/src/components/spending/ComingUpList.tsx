// Dashboard subset: occurrences strictly after today in the current month (or future month list).
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import type { OccurrenceId, SpendingOccurrenceDto } from '@/api/spendingTypes'
import { categoryLabel, occurrenceIdKey } from '@/api/spendingTypes'
import { formatGbp } from '@/lib/formatGbp'

type ComingUpListProps = {
  occurrences: SpendingOccurrenceDto[]
  upcomingIds: OccurrenceId[]
  emptyMessage: string
}

export function ComingUpList({ occurrences, upcomingIds, emptyMessage }: ComingUpListProps) {
  const idSet = new Set(upcomingIds.map(occurrenceIdKey))
  const items = occurrences.filter((o) => idSet.has(occurrenceIdKey(o.id)))

  if (items.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ py: 1 }}>
        {emptyMessage}
      </Typography>
    )
  }

  return (
    <List disablePadding>
      {items.map((item) => (
        <ListItem key={occurrenceIdKey(item.id)} disablePadding sx={{ py: 0.75 }}>
          <ListItemText
            primary={item.name}
            secondary={`${item.effectiveDate} · ${categoryLabel(item.category)}`}
            slotProps={{ primary: { sx: { fontWeight: 600 } } }}
          />
          <Typography sx={{ color: '#e63946', fontWeight: 600 }}>{formatGbp(item.amount)}</Typography>
        </ListItem>
      ))}
    </List>
  )
}
