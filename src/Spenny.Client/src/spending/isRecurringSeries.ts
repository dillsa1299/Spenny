import { SpendingFrequency, type SpendingFrequencyValue } from '@/api/spendingTypes'

export function isRecurringSeries(frequency: SpendingFrequencyValue): boolean {
  return frequency !== SpendingFrequency.OneOff
}
