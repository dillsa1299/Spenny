// Calendar month keys for Dashboard/Spending; boundaries use Europe/London per product spec.
export type MonthKey = {
  year: number
  /** 1–12 */
  month: number
}

const londonTimeZone = 'Europe/London'

export function monthKeyFromDate(date: Date): MonthKey {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: londonTimeZone,
    year: 'numeric',
    month: 'numeric',
  }).formatToParts(date)

  const year = Number(parts.find((p) => p.type === 'year')?.value)
  const month = Number(parts.find((p) => p.type === 'month')?.value)
  return { year, month }
}

export function getCurrentMonthInLondon(now: Date = new Date()): MonthKey {
  return monthKeyFromDate(now)
}

export function shiftMonth(key: MonthKey, delta: number): MonthKey {
  const index = key.year * 12 + (key.month - 1) + delta
  const year = Math.floor(index / 12)
  const month = (index % 12) + 1
  return { year, month }
}

export function formatMonthLabel(key: MonthKey): string {
  const utcMidMonth = new Date(Date.UTC(key.year, key.month - 1, 15, 12, 0, 0))
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: londonTimeZone,
    month: 'long',
    year: 'numeric',
  }).format(utcMidMonth)
}

export function monthKeysEqual(a: MonthKey, b: MonthKey): boolean {
  return a.year === b.year && a.month === b.month
}
