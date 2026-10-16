import type { SpendingMonthDto } from '@/api/spendingTypes'

export function comingUpEmptyMessage(month: SpendingMonthDto): string {
  const selectedIndex = month.year * 12 + (month.month - 1)
  const asOfIndex = month.asOfDate
    ? Number(month.asOfDate.slice(0, 4)) * 12 + (Number(month.asOfDate.slice(5, 7)) - 1)
    : selectedIndex

  if (selectedIndex < asOfIndex) {
    return 'This month is complete — nothing left to come up.'
  }
  if (month.monthTotal === 0) {
    return 'No spending scheduled this month.'
  }
  return 'Nothing else coming up this month.'
}
