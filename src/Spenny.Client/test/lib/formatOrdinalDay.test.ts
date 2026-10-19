import { formatOrdinalDay } from '@/lib/formatOrdinalDay'
import { describe, expect, it } from 'vitest'

describe('formatOrdinalDay', () => {
  it('formats ordinals for typical days', () => {
    expect(formatOrdinalDay('2026-10-01')).toBe('1st')
    expect(formatOrdinalDay('2026-10-02')).toBe('2nd')
    expect(formatOrdinalDay('2026-10-03')).toBe('3rd')
    expect(formatOrdinalDay('2026-10-20')).toBe('20th')
    expect(formatOrdinalDay('2026-10-11')).toBe('11th')
  })
})
