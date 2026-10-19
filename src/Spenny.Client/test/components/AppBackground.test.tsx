import { appBackgroundStyles } from '@/components/AppBackground'
import { describe, expect, it } from 'vitest'

describe('AppBackground', () => {
  it('defines layered body background styles', () => {
    const body = appBackgroundStyles.body
    const image = body.backgroundImage as string
    expect(image.startsWith('repeating-linear-gradient')).toBe(true)
    expect(image).toContain('radial-gradient')
    expect(image).not.toMatch(/linear-gradient\(180deg,\s*#[0-9a-f]+/i)
  })
})
