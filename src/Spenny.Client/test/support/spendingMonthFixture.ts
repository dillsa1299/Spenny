import type { SpendingMonthDto } from '@/api/spendingTypes'
import { SpendingCategory, SpendingFrequency } from '@/api/spendingTypes'

export const october2026MonthFixture: SpendingMonthDto = {
  year: 2026,
  month: 10,
  asOfDate: '2026-10-10',
  monthTotal: 175,
  remainingAtToday: 25,
  showTodayMarker: true,
  burndownSteps: [
    { effectiveDate: '2026-10-05', dayTotal: 150, remainingAfter: 25 },
    { effectiveDate: '2026-10-20', dayTotal: 25, remainingAfter: 0 },
  ],
  upcomingOccurrenceIds: [
    { seriesId: '33333333-3333-3333-3333-333333333333', occurrenceDate: '2026-10-20' },
  ],
  occurrences: [
    {
      id: { seriesId: '11111111-1111-1111-1111-111111111111', occurrenceDate: '2026-10-05' },
      seriesId: '11111111-1111-1111-1111-111111111111',
      occurrenceDate: '2026-10-05',
      effectiveDate: '2026-10-05',
      name: 'A',
      amount: 100,
      category: SpendingCategory.General,
      description: null,
    },
    {
      id: { seriesId: '22222222-2222-2222-2222-222222222222', occurrenceDate: '2026-10-05' },
      seriesId: '22222222-2222-2222-2222-222222222222',
      occurrenceDate: '2026-10-05',
      effectiveDate: '2026-10-05',
      name: 'B',
      amount: 50,
      category: SpendingCategory.Bills,
      description: null,
    },
    {
      id: { seriesId: '33333333-3333-3333-3333-333333333333', occurrenceDate: '2026-10-20' },
      seriesId: '33333333-3333-3333-3333-333333333333',
      occurrenceDate: '2026-10-20',
      effectiveDate: '2026-10-20',
      name: 'C',
      amount: 25,
      category: SpendingCategory.Transport,
      description: null,
    },
  ],
}

export const emptySeriesFixture = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'Gym',
  amount: 30,
  anchorDate: '2026-10-15',
  frequency: SpendingFrequency.OneOff,
  category: SpendingCategory.PersonalCare,
  roundWeekendToFriday: false,
  description: null,
}

export const recurringWeeklySeriesFixture = {
  id: '22222222-2222-2222-2222-222222222222',
  name: 'Cleaner',
  amount: 50,
  anchorDate: '2026-10-05',
  frequency: SpendingFrequency.Weekly,
  category: SpendingCategory.Bills,
  roundWeekendToFriday: false,
  description: null,
}
