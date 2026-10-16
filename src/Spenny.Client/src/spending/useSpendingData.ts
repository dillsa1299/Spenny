// Loads month projection and series templates; refetches when month or revision changes.
import { useCallback, useEffect, useState } from 'react'
import {
  fetchSpendingMonth,
  listSpendingSeries,
} from '@/api/spendingApi'
import type { SpendingMonthDto, SpendingSeriesDto } from '@/api/spendingTypes'
import type { MonthKey } from '@/lib/monthKey'

type SpendingDataState = {
  month: SpendingMonthDto | null
  series: SpendingSeriesDto[]
  loading: boolean
  error: string | null
}

export function useSpendingData(selectedMonth: MonthKey, revision: number) {
  const [state, setState] = useState<SpendingDataState>({
    month: null,
    series: [],
    loading: true,
    error: null,
  })

  const reload = useCallback(() => {
    let cancelled = false
    setState((prev) => ({ ...prev, loading: true, error: null }))

    Promise.all([
      fetchSpendingMonth(selectedMonth.year, selectedMonth.month),
      listSpendingSeries(),
    ])
      .then(([month, series]) => {
        if (!cancelled) {
          setState({ month, series, loading: false, error: null })
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to load spending'
          setState({ month: null, series: [], loading: false, error: message })
        }
      })

    return () => {
      cancelled = true
    }
  }, [selectedMonth.year, selectedMonth.month, revision])

  useEffect(() => {
    return reload()
  }, [reload])

  return state
}
