// Shared selected calendar month for Dashboard and Spending within the authenticated shell.
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getCurrentMonthInLondon, shiftMonth, type MonthKey } from '@/lib/monthKey'

type SelectedMonthContextValue = {
  selectedMonth: MonthKey
  setSelectedMonth: (month: MonthKey) => void
  goToPreviousMonth: () => void
  goToNextMonth: () => void
}

const SelectedMonthContext = createContext<SelectedMonthContextValue | null>(null)

export function SelectedMonthProvider({ children }: { children: ReactNode }) {
  const [selectedMonth, setSelectedMonth] = useState<MonthKey>(() => getCurrentMonthInLondon())

  const goToPreviousMonth = useCallback(() => {
    setSelectedMonth((current) => shiftMonth(current, -1))
  }, [])

  const goToNextMonth = useCallback(() => {
    setSelectedMonth((current) => shiftMonth(current, 1))
  }, [])

  const value = useMemo(
    () => ({
      selectedMonth,
      setSelectedMonth,
      goToPreviousMonth,
      goToNextMonth,
    }),
    [selectedMonth, goToPreviousMonth, goToNextMonth],
  )

  return <SelectedMonthContext.Provider value={value}>{children}</SelectedMonthContext.Provider>
}

export function useSelectedMonth(): SelectedMonthContextValue {
  const ctx = useContext(SelectedMonthContext)
  if (!ctx) {
    throw new Error('useSelectedMonth must be used within SelectedMonthProvider')
  }
  return ctx
}
