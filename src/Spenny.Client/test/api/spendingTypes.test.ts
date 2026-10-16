import { categoryLabel, SpendingCategory } from '@/api/spendingTypes'
import { describe, expect, it } from 'vitest'

describe('spendingTypes', () => {
  it('categoryLabel returns a readable name', () => {
    expect(categoryLabel(SpendingCategory.Bills)).toBe('Bills')
  })
})
