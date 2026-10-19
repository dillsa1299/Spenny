// Groups month occurrences by effective calendar day for burndown tooltips.
import type { SpendingOccurrenceDto } from '@/api/spendingTypes'
import { dayFromIsoDate } from '@/spending/burndownPoints'

export function occurrencesByDay(
  occurrences: SpendingOccurrenceDto[],
): Map<number, SpendingOccurrenceDto[]> {
  const map = new Map<number, SpendingOccurrenceDto[]>()
  for (const occurrence of occurrences) {
    const day = dayFromIsoDate(occurrence.effectiveDate)
    const list = map.get(day)
    if (list) {
      list.push(occurrence)
    } else {
      map.set(day, [occurrence])
    }
  }
  for (const list of map.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name, 'en-GB'))
  }
  return map
}
