// Static month bundle for the public landing preview only — not from the API and not user-specific.
import type { SpendingMonthDto } from '@/api/spendingTypes'
import { SpendingCategory } from '@/api/spendingTypes'

const demoSeries = {
  rent: 'a1000000-0000-4000-8000-000000000001',
  utilities: 'a1000000-0000-4000-8000-000000000002',
  mobile: 'a1000000-0000-4000-8000-000000000003',
  streaming: 'a1000000-0000-4000-8000-000000000004',
} as const

/** Illustrative October 2026 snapshot for marketing; dates and amounts are fictional. */
export const landingDemoMonth: SpendingMonthDto = {
  year: 2026,
  month: 10,
  asOfDate: '2026-10-10',
  monthTotal: 747,
  remainingAtToday: 47,
  showTodayMarker: true,
  burndownSteps: [
    { effectiveDate: '2026-10-05', dayTotal: 700, remainingAfter: 47 },
    { effectiveDate: '2026-10-20', dayTotal: 47, remainingAfter: 0 },
  ],
  upcomingOccurrenceIds: [
    { seriesId: demoSeries.mobile, occurrenceDate: '2026-10-20' },
    { seriesId: demoSeries.streaming, occurrenceDate: '2026-10-20' },
  ],
  occurrences: [
    {
      id: { seriesId: demoSeries.rent, occurrenceDate: '2026-10-05' },
      seriesId: demoSeries.rent,
      occurrenceDate: '2026-10-05',
      effectiveDate: '2026-10-05',
      name: 'Rent',
      amount: 650,
      category: SpendingCategory.Bills,
      description: null,
    },
    {
      id: { seriesId: demoSeries.utilities, occurrenceDate: '2026-10-05' },
      seriesId: demoSeries.utilities,
      occurrenceDate: '2026-10-05',
      effectiveDate: '2026-10-05',
      name: 'Gas & electric',
      amount: 50,
      category: SpendingCategory.Bills,
      description: null,
    },
    {
      id: { seriesId: demoSeries.mobile, occurrenceDate: '2026-10-20' },
      seriesId: demoSeries.mobile,
      occurrenceDate: '2026-10-20',
      effectiveDate: '2026-10-20',
      name: 'Mobile',
      amount: 35,
      category: SpendingCategory.Bills,
      description: null,
    },
    {
      id: { seriesId: demoSeries.streaming, occurrenceDate: '2026-10-20' },
      seriesId: demoSeries.streaming,
      occurrenceDate: '2026-10-20',
      effectiveDate: '2026-10-20',
      name: 'Netflix',
      amount: 12,
      category: SpendingCategory.Entertainment,
      description: null,
    },
  ],
}
