// Types and enums aligned with Spenny.Api.Domain.Spending (JSON enums are numeric).
export const SpendingFrequency = {
  OneOff: 0,
  Weekly: 1,
  Monthly: 2,
  Yearly: 3,
} as const

export type SpendingFrequencyValue = (typeof SpendingFrequency)[keyof typeof SpendingFrequency]

export const SpendingCategory = {
  Bills: 0,
  Charity: 1,
  EatingOut: 2,
  Entertainment: 3,
  Expenses: 4,
  Family: 5,
  Finances: 6,
  General: 7,
  Gifts: 8,
  Groceries: 9,
  Holidays: 10,
  Income: 11,
  PersonalCare: 12,
  Savings: 13,
  Shopping: 14,
  Transfers: 15,
  Transport: 16,
} as const

export type SpendingCategoryValue = (typeof SpendingCategory)[keyof typeof SpendingCategory]

export type OccurrenceId = {
  seriesId: string
  occurrenceDate: string
}

export type SpendingOccurrenceDto = {
  id: OccurrenceId
  seriesId: string
  occurrenceDate: string
  effectiveDate: string
  name: string
  amount: number
  category: SpendingCategoryValue
  description: string | null
}

export type BurndownStepDto = {
  effectiveDate: string
  dayTotal: number
  remainingAfter: number
}

export type SpendingMonthDto = {
  year: number
  month: number
  asOfDate: string
  monthTotal: number
  remainingAtToday: number
  showTodayMarker: boolean
  occurrences: SpendingOccurrenceDto[]
  burndownSteps: BurndownStepDto[]
  upcomingOccurrenceIds: OccurrenceId[]
}

export type SpendingSeriesDto = {
  id: string
  name: string
  amount: number
  anchorDate: string
  frequency: SpendingFrequencyValue
  category: SpendingCategoryValue
  roundWeekendToFriday: boolean
  description: string | null
}

export type SpendingSeriesWrite = {
  name: string
  amount: number
  anchorDate: string
  frequency: SpendingFrequencyValue
  category: SpendingCategoryValue
  roundWeekendToFriday: boolean
  description?: string | null
}

export const SPENDING_FREQUENCY_OPTIONS: { value: SpendingFrequencyValue; label: string }[] = [
  { value: SpendingFrequency.OneOff, label: 'One-off' },
  { value: SpendingFrequency.Weekly, label: 'Weekly' },
  { value: SpendingFrequency.Monthly, label: 'Monthly' },
  { value: SpendingFrequency.Yearly, label: 'Yearly' },
]

export const SPENDING_CATEGORY_OPTIONS: { value: SpendingCategoryValue; label: string }[] = [
  { value: SpendingCategory.Bills, label: 'Bills' },
  { value: SpendingCategory.Charity, label: 'Charity' },
  { value: SpendingCategory.EatingOut, label: 'Eating out' },
  { value: SpendingCategory.Entertainment, label: 'Entertainment' },
  { value: SpendingCategory.Expenses, label: 'Expenses' },
  { value: SpendingCategory.Family, label: 'Family' },
  { value: SpendingCategory.Finances, label: 'Finances' },
  { value: SpendingCategory.General, label: 'General' },
  { value: SpendingCategory.Gifts, label: 'Gifts' },
  { value: SpendingCategory.Groceries, label: 'Groceries' },
  { value: SpendingCategory.Holidays, label: 'Holidays' },
  { value: SpendingCategory.Income, label: 'Income' },
  { value: SpendingCategory.PersonalCare, label: 'Personal care' },
  { value: SpendingCategory.Savings, label: 'Savings' },
  { value: SpendingCategory.Shopping, label: 'Shopping' },
  { value: SpendingCategory.Transfers, label: 'Transfers' },
  { value: SpendingCategory.Transport, label: 'Transport' },
]

export function frequencyLabel(frequency: SpendingFrequencyValue): string {
  return SPENDING_FREQUENCY_OPTIONS.find((o) => o.value === frequency)?.label ?? 'One-off'
}

export function categoryLabel(category: SpendingCategoryValue): string {
  return SPENDING_CATEGORY_OPTIONS.find((o) => o.value === category)?.label ?? 'General'
}

export function occurrenceIdKey(id: OccurrenceId): string {
  return `${id.seriesId}:${id.occurrenceDate}`
}
