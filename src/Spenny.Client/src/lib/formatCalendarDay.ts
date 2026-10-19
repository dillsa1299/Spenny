// Ordinal calendar day with month name (e.g. "20th October") from an ISO date string (YYYY-MM-DD).
import { formatOrdinalDay } from '@/lib/formatOrdinalDay'

export function formatCalendarDay(isoDate: string): string {
  const [year, month] = isoDate.split('-').map(Number)
  const monthName = new Intl.DateTimeFormat('en-GB', { month: 'long', timeZone: 'UTC' }).format(
    new Date(Date.UTC(year, month - 1, 1)),
  )
  return `${formatOrdinalDay(isoDate)} ${monthName}`
}
