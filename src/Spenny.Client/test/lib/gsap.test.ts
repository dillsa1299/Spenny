import { describe, expect, it } from 'vitest'
import { registerGsapPlugins } from '@/lib/gsap'

describe('registerGsapPlugins', () => {
  it('can be called repeatedly without throwing', () => {
    expect(() => {
      registerGsapPlugins()
      registerGsapPlugins()
    }).not.toThrow()
  })
})
