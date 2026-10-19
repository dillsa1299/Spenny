// Supplies month context to the MUI X axis tooltip slot (same chart, all breakpoints).
import { createContext, useContext, type ReactNode } from 'react'
import type { SpendingOccurrenceDto } from '@/api/spendingTypes'

export type BurndownTooltipContextValue = {
  year: number
  month: number
  occurrencesByDay: Map<number, SpendingOccurrenceDto[]>
}

const BurndownTooltipContext = createContext<BurndownTooltipContextValue | null>(null)

export function BurndownTooltipProvider({
  value,
  children,
}: {
  value: BurndownTooltipContextValue
  children: ReactNode
}) {
  return <BurndownTooltipContext.Provider value={value}>{children}</BurndownTooltipContext.Provider>
}

export function useBurndownTooltipContext(): BurndownTooltipContextValue {
  const ctx = useContext(BurndownTooltipContext)
  if (!ctx) {
    throw new Error('useBurndownTooltipContext must be used within BurndownTooltipProvider')
  }
  return ctx
}
