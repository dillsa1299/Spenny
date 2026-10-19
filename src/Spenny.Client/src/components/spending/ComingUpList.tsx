// Dashboard subset: occurrences strictly after today in the current month (or future month list).
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Typography from '@mui/material/Typography'
import type { OccurrenceId, SpendingOccurrenceDto } from '@/api/spendingTypes'
import { categoryLabel, occurrenceIdKey } from '@/api/spendingTypes'
import { formatGbp } from '@/lib/formatGbp'
import { formatOrdinalDay } from '@/lib/formatOrdinalDay'

type ComingUpListProps = {
  occurrences: SpendingOccurrenceDto[]
  upcomingIds: OccurrenceId[]
  emptyMessage: string
}

export function ComingUpList({ occurrences, upcomingIds, emptyMessage }: ComingUpListProps) {
  const byId = new Map(occurrences.map((o) => [occurrenceIdKey(o.id), o]))
  const items = upcomingIds
    .map((id) => byId.get(occurrenceIdKey(id)))
    .filter((o): o is SpendingOccurrenceDto => o !== undefined)

  if (items.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ py: 0.5, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
        {emptyMessage}
      </Typography>
    )
  }

  return (
    <List disablePadding dense sx={{ width: '100%' }}>
      {items.map((item) => (
        <ListItem
          key={occurrenceIdKey(item.id)}
          disablePadding
          sx={{
            py: 0.5,
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) auto',
            columnGap: 1,
            alignItems: 'start',
            width: '100%',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              minWidth: 0,
              fontSize: { xs: '0.8125rem', sm: '0.875rem' },
              lineHeight: 1.35,
              color: 'text.secondary',
            }}
          >
            <Typography
              component="span"
              sx={{ fontWeight: 600, color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}
            >
              {formatOrdinalDay(item.effectiveDate)}
            </Typography>
            {' · '}
            <Typography component="span" sx={{ color: 'text.primary' }}>
              {item.name}
            </Typography>
            {' · '}
            {categoryLabel(item.category)}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: '#e63946',
              fontWeight: 600,
              flexShrink: 0,
              fontSize: { xs: '0.8125rem', sm: '0.875rem' },
              fontVariantNumeric: 'tabular-nums',
              pt: 0.1,
            }}
          >
            {formatGbp(item.amount)}
          </Typography>
        </ListItem>
      ))}
    </List>
  )
}
