/**
 * Filters free-text amount input to digits and at most one '.' with two fractional digits.
 * Empty string is preserved so the field can stay blank while typing.
 */
export function sanitizeAmountInput(raw: string): string {
  let result = ''
  let seenDot = false
  let fractionDigits = 0

  for (const ch of raw) {
    if (ch >= '0' && ch <= '9') {
      if (seenDot) {
        if (fractionDigits >= 2) {
          continue
        }
        fractionDigits += 1
      }
      result += ch
      continue
    }

    if (ch === '.' && !seenDot) {
      seenDot = true
      result += ch
    }
  }

  return result
}
