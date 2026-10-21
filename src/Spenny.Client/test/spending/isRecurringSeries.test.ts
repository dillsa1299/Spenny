import { SpendingFrequency } from '@/api/spendingTypes'
import { isRecurringSeries } from '@/spending/isRecurringSeries'
import { describe, expect, it } from 'vitest'

describe('isRecurringSeries', () => {
  it('returns false for one-off', () => {
    expect(isRecurringSeries(SpendingFrequency.OneOff)).toBe(false)
  })

  it('returns true for repeating frequencies', () => {
    expect(isRecurringSeries(SpendingFrequency.Weekly)).toBe(true)
    expect(isRecurringSeries(SpendingFrequency.Monthly)).toBe(true)
    expect(isRecurringSeries(SpendingFrequency.Yearly)).toBe(true)
  })
})
