// Buckets date-ordered occurrences into consecutive effective-date groups, preserving input order.
import type { SpendingOccurrenceDto } from '@/api/spendingTypes'

export type OccurrenceDateGroup = {
  effectiveDate: string
  items: SpendingOccurrenceDto[]
}

export function groupOccurrencesByDate(items: SpendingOccurrenceDto[]): OccurrenceDateGroup[] {
  const groups: OccurrenceDateGroup[] = []
  for (const item of items) {
    const last = groups.at(-1)
    if (last && last.effectiveDate === item.effectiveDate) {
      last.items.push(item)
    } else {
      groups.push({ effectiveDate: item.effectiveDate, items: [item] })
    }
  }
  return groups
}
