// Static month bundle for the public landing preview only — not from the API and not user-specific.
import type { BurndownStepDto, OccurrenceId, SpendingMonthDto, SpendingOccurrenceDto } from '@/api/spendingTypes'
import { SpendingCategory } from '@/api/spendingTypes'

const DEMO_YEAR = 2026
const DEMO_MONTH = 10
const DEMO_AS_OF = '2026-10-10'

const demoSeries = {
  rent: 'a1000000-0000-4000-8000-000000000001',
  gym: 'a1000000-0000-4000-8000-000000000002',
  councilTax: 'a1000000-0000-4000-8000-000000000003',
  utilities: 'a1000000-0000-4000-8000-000000000004',
  spotify: 'a1000000-0000-4000-8000-000000000005',
  water: 'a1000000-0000-4000-8000-000000000006',
  energy: 'a1000000-0000-4000-8000-000000000007',
  broadband: 'a1000000-0000-4000-8000-000000000008',
  mobile: 'a1000000-0000-4000-8000-000000000009',
  netflix: 'a1000000-0000-4000-8000-00000000000a',
  disney: 'a1000000-0000-4000-8000-00000000000b',
  adobe: 'a1000000-0000-4000-8000-00000000000c',
} as const

function occurrence(
  seriesKey: keyof typeof demoSeries,
  effectiveDate: string,
  name: string,
  amount: number,
  category: (typeof SpendingCategory)[keyof typeof SpendingCategory],
): SpendingOccurrenceDto {
  const seriesId = demoSeries[seriesKey]
  return {
    id: { seriesId, occurrenceDate: effectiveDate },
    seriesId,
    occurrenceDate: effectiveDate,
    effectiveDate,
    name,
    amount,
    category,
    description: null,
  }
}

const demoOccurrences: SpendingOccurrenceDto[] = [
  occurrence('rent', '2026-10-01', 'Rent', 650, SpendingCategory.Bills),
  occurrence('gym', '2026-10-01', 'Gym', 30, SpendingCategory.PersonalCare),
  occurrence('councilTax', '2026-10-03', 'Council tax', 120, SpendingCategory.Bills),
  occurrence('utilities', '2026-10-05', 'Gas & electric', 48, SpendingCategory.Bills),
  occurrence('spotify', '2026-10-07', 'Spotify', 11, SpendingCategory.Entertainment),
  occurrence('water', '2026-10-12', 'Water', 38, SpendingCategory.Bills),
  occurrence('energy', '2026-10-15', 'Octopus Energy', 62, SpendingCategory.Bills),
  occurrence('broadband', '2026-10-18', 'Broadband', 28, SpendingCategory.Bills),
  occurrence('mobile', '2026-10-20', 'Mobile', 35, SpendingCategory.Bills),
  occurrence('netflix', '2026-10-20', 'Netflix', 12, SpendingCategory.Entertainment),
  occurrence('disney', '2026-10-25', 'Disney+', 5, SpendingCategory.Entertainment),
  occurrence('adobe', '2026-10-28', 'Adobe Creative Cloud', 10, SpendingCategory.Expenses),
]

function buildDemoMonthFromOccurrences(
  occurrences: SpendingOccurrenceDto[],
  asOfDate: string,
  year: number,
  month: number,
): SpendingMonthDto {
  const monthTotal = occurrences.reduce((sum, o) => sum + o.amount, 0)

  const byDate = new Map<string, number>()
  for (const o of occurrences) {
    byDate.set(o.effectiveDate, (byDate.get(o.effectiveDate) ?? 0) + o.amount)
  }

  const sortedDates = [...byDate.keys()].sort()
  let remaining = monthTotal
  const burndownSteps: BurndownStepDto[] = sortedDates.map((effectiveDate) => {
    const dayTotal = byDate.get(effectiveDate) ?? 0
    remaining -= dayTotal
    return { effectiveDate, dayTotal, remainingAfter: remaining }
  })

  const upcoming = occurrences
    .filter((o) => o.effectiveDate > asOfDate)
    .sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate) || a.name.localeCompare(b.name))

  const remainingAtToday = upcoming.reduce((sum, o) => sum + o.amount, 0)
  const upcomingOccurrenceIds: OccurrenceId[] = upcoming.map((o) => o.id)

  return {
    year,
    month,
    asOfDate,
    monthTotal,
    remainingAtToday,
    showTodayMarker: true,
    burndownSteps,
    upcomingOccurrenceIds,
    occurrences,
  }
}

/** Illustrative October 2026 snapshot for marketing; dates and amounts are fictional. */
export const landingDemoMonth: SpendingMonthDto = buildDemoMonthFromOccurrences(
  demoOccurrences,
  DEMO_AS_OF,
  DEMO_YEAR,
  DEMO_MONTH,
)
