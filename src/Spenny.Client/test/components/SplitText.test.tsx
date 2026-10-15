import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@gsap/react', () => ({
  useGSAP: (callback: () => void) => {
    callback()
  },
}))

vi.mock('gsap/SplitText', () => ({
  SplitText: class {
    chars: unknown[] = []
    revert() {}
  },
}))

import SplitText from '@/components/SplitText'

describe('SplitText', () => {
  it('renders the provided text', () => {
    render(<SplitText text="Animated copy" tag="p" />)
    expect(screen.getByText('Animated copy')).toBeInTheDocument()
  })
})
