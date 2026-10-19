import { render, waitFor } from '@testing-library/react'
import { BlurText } from '@/components/BlurText'
import { gsap } from 'gsap'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('gsap', () => ({
  gsap: {
    fromTo: vi.fn(),
    set: vi.fn(),
  },
}))

function mockMatchMedia(reducedMotion: boolean) {
  vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
    matches: query.includes('prefers-reduced-motion') && reducedMotion,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

describe('BlurText', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('skips motion animation when prefers-reduced-motion is set', async () => {
    mockMatchMedia(true)
    render(<BlurText text="Spenny" />)

    await waitFor(() => {
      expect(gsap.set).toHaveBeenCalled()
    })
    expect(gsap.fromTo).not.toHaveBeenCalled()
  })

  it('animates when reduced motion is not requested', async () => {
    mockMatchMedia(false)
    render(<BlurText text="Spenny" />)

    await waitFor(() => {
      expect(gsap.fromTo).toHaveBeenCalled()
    })
    expect(gsap.set).not.toHaveBeenCalled()
  })
})
