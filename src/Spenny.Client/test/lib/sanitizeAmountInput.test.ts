import { sanitizeAmountInput } from '@/lib/sanitizeAmountInput'
import { describe, expect, it } from 'vitest'

describe('sanitizeAmountInput', () => {
  it('preserves an empty string', () => {
    expect(sanitizeAmountInput('')).toBe('')
  })

  it('keeps digit-only amounts', () => {
    expect(sanitizeAmountInput('12')).toBe('12')
  })

  it('allows a single decimal point and up to two fractional digits', () => {
    expect(sanitizeAmountInput('12.')).toBe('12.')
    expect(sanitizeAmountInput('12.5')).toBe('12.5')
    expect(sanitizeAmountInput('12.50')).toBe('12.50')
    expect(sanitizeAmountInput('.5')).toBe('.5')
  })

  it('drops a third fractional digit', () => {
    expect(sanitizeAmountInput('12.501')).toBe('12.50')
  })

  it('strips letters and symbols other than one decimal point', () => {
    expect(sanitizeAmountInput('abc')).toBe('')
    expect(sanitizeAmountInput('12a.5b')).toBe('12.5')
    expect(sanitizeAmountInput('£12.50')).toBe('12.50')
  })

  it('sanitises mixed pasted content and strips commas', () => {
    expect(sanitizeAmountInput('abc12.5xyz')).toBe('12.5')
    expect(sanitizeAmountInput('12,50')).toBe('1250')
    expect(sanitizeAmountInput('12.5.6')).toBe('12.56')
  })
})
