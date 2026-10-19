// Dashboard subset: upcoming occurrences grouped by effective date (API order preserved).
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { OccurrenceId, SpendingOccurrenceDto } from '@/api/spendingTypes'
import { categoryLabel, occurrenceIdKey } from '@/api/spendingTypes'
import { formatCalendarDay } from '@/lib/formatCalendarDay'
import { formatGbp } from '@/lib/formatGbp'
import { groupOccurrencesByDate } from '@/spending/groupOccurrencesByDate'

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

  const groups = groupOccurrencesByDate(items)

  return (
    <Stack spacing={1.25} sx={{ width: '100%' }}>
      {groups.map((group) => (
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
          <List disablePadding dense sx={{ width: '100%' }}>
            {group.items.map((item) => (
              <ListItem
                key={occurrenceIdKey(item.id)}
                disablePadding
                sx={{
                  py: 0.35,
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
        </Stack>
      ))}
    </Stack>
  )
}
